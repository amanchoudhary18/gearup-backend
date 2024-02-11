const User = require("../models/user.model");
const generateOTP = require("../utils/generateOTP");
const OtpModel = require("../models/otp.model");
require("dotenv").config({ path: "../.env" });
const referralCodeGenerator = require("referral-code-generator");
const Connection = require("../models/connection.model");
const Game = require("../models/game.model");
const sendOtp = require("../utils/sendOTP");
const Aws = require("aws-sdk");
const Notification = require("../models/notification.model");
const calculateAverageRating = require("../utils/calculateAverageRating");
const getRecentReviewsForUser = require("../utils/recentReviewsForUser");

const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function calculateRating(userId) {
  try {
    const gamesAsPlayer1 = await Game.find({ player1: userId });

    const gamesAsPlayer2 = await Game.find({ player2: userId });

    let score = 0;
    let games = 0;

    gamesAsPlayer1.forEach((game) => {
      if (game.player2Feedback.updated) {
        games++;
        score +=
          game.player2Feedback.punctuality +
          game.player2Feedback.sportsmanship +
          game.player2Feedback.teamPlayer +
          game.player2Feedback.competitiveness +
          game.player2Feedback.respectful;
      }
    });

    gamesAsPlayer2.forEach((game) => {
      if (game.player1Feedback.updated) {
        games++;
        score +=
          game.player1Feedback.punctuality +
          game.player1Feedback.sportsmanship +
          game.player1Feedback.teamPlayer +
          game.player1Feedback.competitiveness +
          game.player1Feedback.respectful;
      }
    });

    const rating = games > 0 ? score / (games * 2) : null;

    return rating;
  } catch (error) {
    console.error("Error calculating rating:", error);
    throw error;
  }
}

//register function
exports.register = async (req, res) => {
  const { mobileNumber, country } = req.body;
  try {
    const otp = generateOTP(4);
    const otpModel = {
      otp: otp,
      status: true,
      mobileNumber,
      country,
    };

    const otpDb = new OtpModel(otpModel);
    const otpsave = await otpDb.save();

    try {
      sendOtp(otp, mobileNumber);
    } catch (error) {
      console.log("OTP sent failed : ", error);
    }

    setTimeout(async () => {
      const otpupdate = await OtpModel.findOneAndUpdate(
        { _id: otpsave._id },
        { otp: otp, status: false }
      );
    }, 100000);

    res.status(200).json({
      status: "Successful",
      message: "otp sent",
      otpId: otpsave._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Failed",
      message: "Failed to json OTP",
    });
  }
};

// otp-verification
exports.otpverification = async (req, res) => {
  try {
    const otp = req.body.otpEntered;
    const otpId = req.body.otpId;
    const otpDB = await OtpModel.findById(otpId);
    const mobileNumber = otpDB.mobileNumber;
    const country = otpDB.country;

    if (otpDB.otp == otp && otpDB.status) {
      const existingUser = await User.findOne({ mobileNumber });

      if (existingUser) {
        const token = await existingUser.generateAuthToken();
        res.status(200).json({
          status: "Successful",
          user: existingUser,
          token,
        });
      } else {
        let referralCode;
        let isReferralCodeUnique = false;

        while (!isReferralCodeUnique) {
          referralCode = referralCodeGenerator.alphaNumeric("uppercase", 3, 3);

          const existingUserWithReferralCode = await User.findOne({
            referral_code: referralCode,
          });

          if (!existingUserWithReferralCode) {
            isReferralCodeUnique = true;
          }
        }

        const user = new User({
          mobileNumber,
          country,
          referral_code: referralCode,
        });
        await user.save();
        const token = await user.generateAuthToken();
        res.status(200).json({
          status: "Successful",
          user,
          token,
        });
      }
    } else {
      res.status(200).json({ status: "Failed", message: "Wrong OTP entered" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "Failed", message: "Couldn't verify the OTP" });
  }
};

// Update User
exports.update = async (req, res) => {
  const allowedFields = [
    "favorite_sports",
    "objective",
    "play_time",
    "first_name",
    "last_name",
    "birthday",
    "gender",
    "addresses",
    "bio",
    "profession",
    "current_address",
    "img",
    "social_media",
    "posh_training",
  ];

  const updateFields = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
  );

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `profile_images/${req.user._id}_${Date.now()}.jpg`,
        Body: req.file.buffer,
        ACL: "public-read-write",
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      updateFields.img = uploadResult.Location;
    }

    Object.assign(user, updateFields);

    // check lat lng before adding
    if (updateFields.current_address) {
      user.addresses.push(updateFields.current_address);
    }

    user.new_user = false;
    await user.save();

    res.status(200).json({ status: "Successful", user });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// Get User
exports.mydata = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.user._id;

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    const birthday = new Date(user.birthday);
    const ageDate = new Date(Date.now() - birthday.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const name = `${user.first_name} ${user.last_name ? user.last_name : ""}`;

    const currentUser = await User.findOne({ _id: req.user._id });
    const favoriteSports = currentUser.favorite_sports.map(
      (favSport) => favSport.sport
    );

    // Fetch games based on the favorite sports
    const games = await Game.find({
      $or: [{ player1: userId }, { player2: userId }],
      sport: { $in: favoriteSports },
      gameStatus: "Accepted",
      scorecard: { updated: true },
    });

    // Calculate total games played and total games won for each sport
    const gameStats = favoriteSports.reduce((result, favSport) => {
      const sportGames = games.filter((game) => game.sport.equals(favSport));

      if (sportGames.length > 0) {
        const gamesPlayed = sportGames.length;

        const gamesWon = sportGames.reduce((total, game) => {
          return total + (userId == game.scorecard.winner ? 1 : 0);
        }, 0);

        const totalAverageRating = sportGames.reduce((total, game) => {
          const feedback = userId.equals(game.player1)
            ? game.player2Feedback
            : game.player1Feedback;
          const gameRating = calculateAverageRating(feedback);
          return total + gameRating;
        }, 0);

        const averageRating =
          gamesPlayed > 0 ? totalAverageRating / gamesPlayed : null;

        let level;
        if (averageRating !== null) {
          if (averageRating >= 0.5 && averageRating <= 1.5) {
            level = "Beginner";
          } else if (averageRating > 1.5 && averageRating <= 2) {
            level = "Intermediate";
          } else {
            level = "Pro";
          }
        }

        result.push({
          sport_id: favSport,
          matches_played: gamesPlayed,
          matches_won: gamesWon,
          rating: level,
        });
      }

      return result;
    }, []);

    const userData = {
      ...user._doc,
      name: name.trim(),
      age,
      rating: await calculateRating(user._id),
      ratings: getRecentReviewsForUser(user._id),
      game_stats: gameStats,
    };

    delete userData.first_name;
    delete userData.last_name;

    delete userData.tokens;

    res.status(200).json({
      status: "Successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// Get Player with filters

exports.getPlayers = async (req, res) => {
  try {
    const currentUser = req.user;
    console.log(currentUser);
    const { gender, range, favouriteSport, favouriteSportLevel, max_age } =
      req.body;

    let filter = {};

    if (gender && gender !== "All") {
      filter.gender = gender;
    }

    if (favouriteSport && favouriteSportLevel) {
      filter["favorite_sports"] = {
        $elemMatch: {
          sport: favouriteSport,
          level: favouriteSportLevel,
        },
      };
    }

    const allUsers = await User.find({
      ...filter,
      _id: { $nin: [...currentUser.connections, currentUser._id] },
    }).select([
      "img",
      "first_name",
      "last_name",
      "age",
      "gender",
      "distance",
      "favorite_sports",
      "rating",
      "birthday",
    ]);

    console.log(allUsers);

    const playersWithDistances = allUsers
      .map((user) => {
        const distance = getDistanceFromLatLonInKm(
          user.current_address?.lat,
          user.current_address?.lng,
          currentUser.current_address?.lat,
          currentUser.current_address?.lng
        );

        if (user.birthday) {
          const birthday = new Date(user.birthday);
          const ageDate = new Date(Date.now() - birthday.getTime());
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);
          const name = `${user.first_name} ${
            user.last_name ? user.last_name : ""
          }`;
          return { ...user._doc, distance, age, name: name.trim() };
        }
        const name = `${user.first_name} ${
          user.last_name ? user.last_name : ""
        }`;

        return { ...user._doc, distance, age: null, name: name.trim() };
      })
      .filter((player) => (range ? player.distance <= range : true))
      .filter((player) => (max_age ? player.age <= max_age : true))
      .map(({ first_name, last_name, ...rest }) => rest);

    playersWithDistances.sort((a, b) => a.distance - b.distance);

    playersWithDistances.forEach((player) => {
      player.distance = Number(player.distance.toFixed(2));
    });

    const playersWithConnections = await Promise.all(
      playersWithDistances.map(async (player) => {
        const connection = await Connection.findOne({
          $or: [
            { sender: currentUser._id, receiver: player._id },
            { sender: player._id, receiver: currentUser._id },
          ],
        });
        const rating = await calculateRating(player._id);
        if (connection) {
          return {
            ...player,
            rating,
            connection_data: {
              connection: true,
              connection_status: connection.status,
              isSender:
                String(connection.sender) === String(req.user._id)
                  ? true
                  : false,
            },
          };
        } else {
          return {
            ...player,
            rating,
            connection_data: {
              connection: false,
              connection_status: null,
              isSender: null,
            },
          };
        }
      })
    );

    res
      .status(200)
      .json({ status: "Successful", players: playersWithConnections });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getAnyPlayer = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    });

    const connection_data = connection
      ? {
          connection: true,
          connection_status: connection.status,
          isSender:
            String(connection.sender) === String(req.user._id) ? true : false,
        }
      : {
          connection: false,
          connection_status: null,
          isSender: null,
        };
    const birthday = new Date(user.birthday);
    const ageDate = new Date(Date.now() - birthday.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const name = `${user.first_name} ${user.last_name ? user.last_name : ""}`;

    const currentUser = await User.findOne({ _id: req.user._id });
    const favoriteSports = currentUser.favorite_sports.map(
      (favSport) => favSport.sport
    );

    // Fetch games based on the favorite sports
    const games = await Game.find({
      $or: [{ player1: userId }, { player2: userId }],
      sport: { $in: favoriteSports },
      gameStatus: "Accepted",
      scorecard: { updated: true },
    });

    // Calculate total games played and total games won for each sport
    const gameStats = favoriteSports.reduce((result, favSport) => {
      const sportGames = games.filter((game) => game.sport.equals(favSport));

      if (sportGames.length > 0) {
        const gamesPlayed = sportGames.length;

        const gamesWon = sportGames.reduce((total, game) => {
          return total + (userId == game.scorecard.winner ? 1 : 0);
        }, 0);

        const totalAverageRating = sportGames.reduce((total, game) => {
          const feedback = userId.equals(game.player1)
            ? game.player2Feedback
            : game.player1Feedback;
          const gameRating = calculateAverageRating(feedback);
          return total + gameRating;
        }, 0);

        const averageRating =
          gamesPlayed > 0 ? totalAverageRating / gamesPlayed : null;

        let level;
        if (averageRating !== null) {
          if (averageRating >= 0.5 && averageRating <= 1.5) {
            level = "Beginner";
          } else if (averageRating > 1.5 && averageRating <= 2) {
            level = "Intermediate";
          } else {
            level = "Pro";
          }
        }

        result.push({
          sport_id: favSport,
          matches_played: gamesPlayed,
          matches_won: gamesWon,
          rating: level,
        });
      }

      return result;
    }, []);

    // user data
    const userData = {
      ...user._doc,
      name: name.trim(),
      age,
      rating: await calculateRating(user._id),
      connection_data,
      ratings: getRecentReviewsForUser(user._id),

      game_stats: gameStats,
    };

    delete userData.first_name;
    delete userData.last_name;
    delete userData.tokens;

    res.status(200).json({
      status: "Successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });

    await req.user.save();

    res
      .status(200)
      .json({ status: "Successful", message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// verify referral code
exports.verifyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    const user = await User.findOne({ referral_code: referralCode });
    if (!user) {
      res.status(200).json({ status: "Successful", verfied: false });
    } else {
      res
        .status(200)
        .json({ status: "Successful", verfied: true, referredBy: user });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// fetch Notifications
exports.fetchNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).populate(
      "notifications"
    );

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    if (!user.notifications) {
      return res.status(200).json({ status: "Successful", notifications: [] });
    }

    res
      .status(200)
      .json({ status: "Successful", notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
