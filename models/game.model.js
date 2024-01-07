const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdDate: {
    type: Number,
    default: Date.now,
  },
  matchDate: {
    type: Number,
  },
  duration: {
    type: Number,
    default: 0, // Duration in minutes
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sport",
    required: true,
  },
  result: {
    type: String,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true,
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  matchesWonByPlayer1: {
    type: Number,
    default: 0,
  },
  matchesWonByPlayer2: {
    type: Number,
    default: 0,
  },
  matchesDrawn: {
    type: Number,
    default: 0,
  },
  ratings: {
    punctuality: {
      type: Number,
      enum: [0, 1, 2],
    },
    sportsmanship: {
      type: Number,
      enum: [0, 1, 2],
    },
    teamPlayer: {
      type: Number,
      enum: [0, 1, 2],
    },
    competitiveness: {
      type: Number,
      enum: [0, 1, 2],
    },
    respectful: {
      type: Number,
      enum: [0, 1, 2],
    },
    reviewMessage: {
      type: Number,
      enum: [0, 1, 2],
    },
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
