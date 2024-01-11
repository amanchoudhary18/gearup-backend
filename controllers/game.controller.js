const Game = require("../models/game.model");

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
      duration,
      result: "Pending",
      venue,
    });

    res.status(201).json({ status: "Success", game: newGame });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({})
      .populate("player1", "first_name last_name")
      .populate("player2", "first_name last_name")
      .populate("venue", "name location")
      .populate("sport", "name");

    res.status(200).json({ status: "Success", games });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getMyGames = async (req, res) => {
  try {
    const currentDate = Date.now();
    const games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }],
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

    if (String(game.player1) === String(req.user._id)) {
      game.sport = req.body.sport || game.sport;
      game.matchDate = req.body.matchDate || game.matchDate;
      game.duration = req.body.duration || game.duration;
      game.venue = req.body.venue || game.venue;

      if (!game.scorecard.updated && req.body.scorecard) {
        game.scorecard = req.body.scorecard;
        game.scorecard.updated = true;
      }

      if (!game.player1Feedback.updated && req.body.player1Feedback) {
        game.player1Feedback = req.body.player1Feedback;
        game.player1Feedback.updated = true;
      }

      game.matchesWonByPlayer2 =
        req.body.matchesWonByPlayer2 || game.matchesWonByPlayer2;
      game.matchesDrawn = req.body.matchesDrawn || game.matchesDrawn;

      game.matchesPlayed =
        game.matchesWonByPlayer1 + game.matchesWonByPlayer2 + game.matchesDrawn;
    } else {
      if (!game.player2Feedback.updated && req.body.player2Feedback) {
        game.player2Feedback = req.body.player2Feedback;
        game.player2Feedback.updated = true;
      }
    }

    const updatedGame = await game.save();

    res.status(200).json({ status: "Success", game: updatedGame });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
