const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    sentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
