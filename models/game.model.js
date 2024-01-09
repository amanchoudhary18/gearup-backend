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

  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true,
  },

  scorecard: {
    matchesPlayed: {
      type: Number,
      default: null,
    },
    matchesWonByPlayer1: {
      type: Number,
      default: null,
    },
    matchesWonByPlayer2: {
      type: Number,
      default: null,
    },
    matchesDrawn: {
      type: Number,
      default: null,
    },
    updated: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  player1Feedback: {
    punctuality: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    sportsmanship: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    teamPlayer: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    competitiveness: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    respectful: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    reviewMessage: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    updated: {
      type: Boolean,
      default: false,
    },
  },

  player2Feedback: {
    punctuality: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    sportsmanship: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    teamPlayer: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    competitiveness: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    respectful: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    reviewMessage: {
      type: Number,
      enum: [0, 1, 2],
      default: null,
    },
    updated: {
      type: Boolean,
      default: false,
    },
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
