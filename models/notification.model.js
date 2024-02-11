const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true, default: null },
    type: {
      type: String,
      enum: [
        "Sent Message",
        "Accepted Connection Request",
        "Sent Connection Request",
        "Sent Game Request",
      ],
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
