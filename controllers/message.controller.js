const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

exports.sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content) {
      res
        .status(400)
        .json({ status: "Failed", message: "Message should not be empty" });
    }

    if (!chatId) {
      res
        .status(404)
        .json({ status: "Failed", message: "Chat could not be found" });
    }

    const chat = await Chat.findOne({ _id: chatId });

    if (!chat) {
      res
        .status(404)
        .json({ status: "Failed", message: "Chat could not be found" });
    }

    const newMessageBody = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    var message = await Message.create(newMessageBody);

    // message = await message.populate({
    //   path: "sender",
    //   select: "first_name last_name img",
    //   options: {
    //     transform: function (doc) {
    //       doc.name = (doc.first_name + " " + doc.last_name).trim();
    //       doc.createdAt = new Date(doc.createdAt).getTime();
    //       delete doc.first_name;
    //       delete doc.last_name;
    //       return doc;
    //     },
    //   },
    // });

    // message = message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "first_name last_name img",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    const senderId = chat.users.filter(
      (user) => String(user) == req.user._id
    )[0];

    const receiverId = chat.users.filter(
      (user) => String(user) != req.user._id
    )[0];

    const notification = await Notification.create({
      sender: senderId,
      content: `${req.user.first_name} has sent you a message`,
      type: "Sent Message",
    });

    const receiver = await User.findOne({ _id: receiverId });
    receiver.notifications.push(notification);

    await receiver.save();

    message = {
      ...message._doc,
      createdAt: new Date(message.createdAt).getTime(),
    };

    res.status(200).json({ status: "Successful", message });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    if (!chatId) {
      res
        .status(404)
        .send({ status: "Failed", message: "Chat could not be found" });
    }
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate({
        path: "game",
        populate: {
          path: "venue",
          select: "name location",
          model: "Venue",
        },
      });

    const modifiedMessages = messages.map((message) => {
      return {
        ...message._doc,
        createdAt: new Date(message.createdAt).getTime(),
        game: !message.isGame
          ? message.game
          : {
              ...message._doc.game._doc,
              isHost: String(req.user._id) === String(message.game.player1._id),
            },
      };
    });
    // console.log(messages);
    res.status(200).json({
      status: "Successful",
      messages: modifiedMessages,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
