const Chat = require("../models/chat.model");
const Game = require("../models/game.model");
const Message = require("../models/message.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const {
  playedWith5,
  feedbackUpdatedFor5,
  feedbackReceivedFrom5,
} = require("../utils/bucksCheck");

exports.createGame = async (req, res) => {
  try {
    const { player2, venue, sport, matchDate, duration } = req.body;

    if (String(req.user._id) === String(player2)) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Both players cannot be the same" });
    }

    const newGame = await Game.create({
      player1: req.user._id,
      player2,
      sport,
      createdDate: Date.now(),
      matchDate,
      duration: duration ? duration : 60,
      result: "Pending",
      venue,
    });

    const isChat = await Chat.findOne({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: player2 } } },
      ],
    });

    if (!isChat) {
      res.status(400).json({ status: "Failed", message: "Chat doesn't exist" });
    }

    const message = await Message.create({
      sender: req.user._id,
      chat: isChat._id,
      isGame: true,
      game: newGame._id,
    });

    const notification = await Notification.create({
      sender: req.user._id,
      content: `${req.user.first_name} has sent you a game request`,
      type: "Sent Game Request",
    });

    const receiver = await User.findOne({ _id: player2 });
    receiver.notifications.push(notification);

    await receiver.save();

    res.status(201).json({ status: "Success", game: newGame });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({ gameStatus: "Accepted" })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    res.status(200).json({ status: "Success", games });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getGame = async (req, res) => {
  const { gameId } = req.params;
  try {
    const game = await Game.findOne({ _id: gameId })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    const gameBody = {
      ...game._doc,
      isHost: String(req.user._id) === String(game.player1._id),
    };

    res.status(200).json({ status: "Success", game: gameBody });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getMyGames = async (req, res) => {
  try {
    const currentDate = Date.now();
    const games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }],
      gameStatus: "Accepted",
    })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    const recentGames = games
      .filter((game) => {
        if (game.matchDate < currentDate - game.duration * 60 * 1000) {
          return true;
        }
        return false;
      })
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        // status:
        //   game.checked_in.player1 && game.checked_in.player2
        //     ? "Recent"
        //     : "Game Cancelled",

        status: "Recent",
      }));

    const liveGames = games
      .filter((game) => {
        const matchStartTime = game.matchDate;
        const matchEndTime = matchStartTime + game.duration * 60 * 1000;
        if (matchStartTime <= currentDate && currentDate <= matchEndTime) {
          return true;
        }
        return false;
      })
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        status: "Live",
      }));

    const upcomingGames = games
      .filter((game) => game.matchDate > currentDate)
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        status: "Upcoming",
      }));

    res.status(200).json({
      status: "Success",
      games: [...recentGames, ...liveGames, ...upcomingGames],
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getRecentGames = async (req, res) => {
  try {
    const currentDate = Date.now();

    let games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }],
      gameStatus: "Accepted",
    })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    games = games
      .filter((game) => {
        if (game.matchDate < currentDate - game.duration * 60 * 1000) {
          return true;
        }
        return false;
      })
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        //  status:
        //     game.checked_in.player1 && game.checked_in.player2
        //       ? "Recent"
        //       : "Game Cancelled",

        status: "Recent",
      }));

    res.status(200).json({ status: "Success", games: games });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getLiveGames = async (req, res) => {
  try {
    const currentDate = Date.now();

    let games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }],
      gameStatus: "Accepted",
    })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    games = games
      .filter((game) => {
        const matchStartTime = game.matchDate;
        const matchEndTime = matchStartTime + game.duration * 60 * 1000;
        if (matchStartTime <= currentDate && currentDate <= matchEndTime) {
          return true;
        }
        return false;
      })
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        status: "Live",
      }));

    res.status(200).json({ status: "Success", games: games });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getUpcomingGames = async (req, res) => {
  try {
    const currentDate = Date.now();

    let games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }],
      gameStatus: "Accepted",
    })
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    games = games
      .filter((game) => game.matchDate > currentDate)
      .map((game) => ({
        ...game._doc,
        isHost: String(req.user._id) === String(game.player1._id),
        player1: {
          _id: game.player1._id,
          name: `${game.player1.first_name ? game.player1.first_name : ""} ${
            game.player1.last_name ? game.player1.last_name : ""
          }`.trim(),
        },
        player2: {
          _id: game.player2._id,
          name: `${game.player2.first_name ? game.player2.first_name : ""} ${
            game.player2.last_name ? game.player2.last_name : ""
          }`.trim(),
        },

        status: "Upcoming",
      }));

    res.status(200).json({ status: "Success", games: games });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const game = await Game.findById(gameId);

    if (!game) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Game not found" });
    }

    const player1 = await User.findOne({ _id: game.player1 });
    const player2 = await User.findOne({ _id: game.player2 });

    if (String(game.player1) === String(req.user._id)) {
      game.sport = req.body.sport || game.sport;
      game.matchDate = req.body.matchDate || game.matchDate;
      game.duration = req.body.duration || game.duration;
      game.venue = req.body.venue || game.venue;

      if (!game.scorecard.updated && req.body.scorecard) {
        game.scorecard = req.body.scorecard;
        game.scorecard.updated = true;

        game.scorecard.matchesPlayed =
          game.scorecard.matchesWonByPlayer1 +
          game.scorecard.matchesWonByPlayer2;
        // + game.scorecard.matchesDrawn;
      }

      if (!game.player1Feedback.updated && req.body.player1Feedback) {
        game.player1Feedback = req.body.player1Feedback;
        game.player1Feedback.updated = true;

        if (feedbackUpdatedFor5(player1._id)) {
          player1.handleBucksRewards("65c80247e788dc5e7faca357");
        }

        if (feedbackReceivedFrom5(player1._id)) {
          player1.handleBucksRewards("65c80254e788dc5e7faca359");
        }
      }

      if (!game.checked_in.player1 && req.body.checked_in) {
        if (req.body.checked_in.player1) {
          player1.handleBucksRewards("65c8023ce788dc5e7faca355");
        }
        game.checked_in.player1 = req.body.checked_in.player1;
      }
    } else {
      if (!game.player2Feedback.updated && req.body.player2Feedback) {
        game.player2Feedback = req.body.player2Feedback;
        game.player2Feedback.updated = true;

        if (feedbackUpdatedFor5(player2._id)) {
          player2.handleBucksRewards("65c80247e788dc5e7faca357");
        }

        if (feedbackReceivedFrom5(player2._id)) {
          player2.handleBucksRewards("65c80254e788dc5e7faca359");
        }
      }

      if (!game.checked_in.player2 && req.body.checked_in) {
        if (req.body.checked_in.player1) {
          player2.handleBucksRewards("65c8023ce788dc5e7faca355");
        }
        game.checked_in.player2 = req.body.checked_in?.player2;
      }
    }

    if (req.body.gameStatus === "Cancelled" && !req.body.cancelledBy) {
    } else {
      game.gameStatus = req.body.gameStatus || game.gameStatus;
      game.cancelledBy = req.body.cancelledBy || game.cancelledBy;

      if (req.body.gameStatus === "Accepted") {
        if (playedWith5(player1._id)) {
          player1.handleBucksRewards("65c8021de788dc5e7faca353");
        }

        if (playedWith5(player2._id)) {
          player2.handleBucksRewards("65c8021de788dc5e7faca353");
        }
      }
    }

    const updatedGame = await game.save();

    const updatedGameBody = {
      ...updatedGame._doc,
      isHost: String(req.user._id) === String(updatedGame.player1._id),
    };

    res.status(200).json({ status: "Success", game: updatedGameBody });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
