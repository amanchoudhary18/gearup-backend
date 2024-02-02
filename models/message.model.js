const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true, default: null },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    isGame: { type: Boolean, default: false },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", default: null },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
