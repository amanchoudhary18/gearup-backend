const User = require("../models/user.model");
const generateOTP = require("../utils/generateOTP");
const OtpModel = require("../models/otp.model");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const referralCodeGenerator = require("referral-code-generator");
const geolib = require("geolib");

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
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

    setTimeout(async () => {
      const otpupdate = await OtpModel.findOneAndUpdate(
        { _id: otpsave._id },
        { otp: otp, status: false }
      );
    }, 100000);

    res.status(200).send({
      status: "Successful",
      message: "otp sent",
      otpId: otpsave._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "Failed",
      message: "Failed to send OTP",
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
        res.status(200).send({
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
        res.status(200).send({
          status: "Successful",
          user,
          token,
        });
      }
    } else {
      res.status(500).send({ status: "Failed", message: "Wrong OTP entered" });
    }
  } catch (error) {
    res.status(500).send({ status: "Failed", message: "Wrong OTP entered" });
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
  ];

  const updateFields = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
  );

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .send({ status: "Failed", message: "User not found" });
    }

    if (updateFields.current_address) {
      user.addresses.push(updateFields.current_address);
    }

    Object.assign(user, updateFields);
    user.new_user = false;
    await user.save();

    res.status(200).send({ status: "Successful", user });
  } catch (error) {
    res.status(500).send({ status: "Failed", message: error.message });
  }
};

// Get User
exports.mydata = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(404)
        .send({ status: "Failed", message: "User not found" });
    }

    res.status(200).send({ status: "Successful", user });
  } catch (error) {
    res.status(500).send({ status: "Failed", message: error.message });
  }
};

// Get Players
exports.getPlayers = async (req, res) => {
  try {
    const currentUser = req.user;

    const allUsers = await User.find({ _id: { $ne: req.user._id } });

    const playersWithDistances = allUsers.map((user) => {
      const distance = getDistanceFromLatLonInKm(
        user.current_address.lat,
        user.current_address.lng,
        currentUser.current_address.lat,
        currentUser.current_address.lng
      );
      return { user, distance };
    });

    playersWithDistances.sort((a, b) => a.distance - b.distance);

    res.status(200).json({ status: "Successful", playersWithDistances });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

// Get Player with filters
exports.getFilteredPlayers = async (req, res) => {
  try {
    const currentUser = req.user;
    const { gender, range, favouriteSport } = req.body;

    let filter = { _id: { $ne: currentUser._id } };

    if (gender && gender !== "All") {
      filter.gender = gender;
    }

    if (favouriteSport) {
      filter["favorite_sports.sport"] = favouriteSport;
      filter["favorite_sports.level"] = currentUser.favorite_sports.find(
        (sport) => sport.sport.toString() === favouriteSport
      ).level;
    }

    const allUsers = await User.find(filter);

    const playersWithDistances = allUsers
      .map((user) => {
        const distance = getDistanceFromLatLonInKm(
          user.current_address.lat,
          user.current_address.lng,
          currentUser.current_address.lat,
          currentUser.current_address.lng
        );
        return { user, distance };
      })
      .filter((player) => player.distance <= range);

    playersWithDistances.sort((a, b) => a.distance - b.distance);

    res
      .status(200)
      .json({ status: "Successful", players: playersWithDistances });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getAnyPlayer = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .send({ status: "Failed", message: "User not found" });
    }

    res.status(200).send({ status: "Successful", user });
  } catch (error) {
    res.status(500).send({ status: "Failed", message: error.message });
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
      .send({ status: "Successful", message: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({ status: "Failed", message: error.message });
  }
};
