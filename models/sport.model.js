const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    level: {
      type: String,
      enum: [
        "Beginner",
        "Professional",
        "Intermediate",
        "Coach/Trainer",
        "Advance",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Sport = mongoose.model("Sport", sportSchema);

module.exports = Sport;
