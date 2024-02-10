const mongoose = require("mongoose");

const bucksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      default: 1, // default to 1 if not provided (for one-time tasks)
    },
  },
  {
    timestamps: true,
  }
);

const Bucks = mongoose.model("Bucks", bucksSchema);

module.exports = Bucks;
