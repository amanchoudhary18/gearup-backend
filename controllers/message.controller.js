const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content) {
      res
        .status(400)
        .send({ status: "Failed", message: "Message should not be empty" });
    }

    if (!chatId) {
      res
        .status(404)
        .send({ status: "Failed", message: "Chat could not be found" });
    }

    const newMessageBody = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    var message = await Message.create(newMessageBody);

    message = await message.populate("sender", "first_name last_name img");
    message = message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "first_name last_name img",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(200).json({ status: "Successful", message });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const sports = await Sport.find();
    res.status(200).json({
      status: "Successful",
      message: "Fetched all sports",
      sports,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
