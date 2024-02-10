const mongoose = require("mongoose");
const Bucks = require("./buck.model");
const User = require("./user.model");

const buckTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bucks",
      required: true,
    },
    date: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const BuckTransaction = mongoose.model(
  "BuckTransaction",
  buckTransactionSchema
);

module.exports = BuckTransaction;
