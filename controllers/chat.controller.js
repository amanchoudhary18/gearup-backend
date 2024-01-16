const Chat = require("../models/chat.model");
const User = require("../models/user.model");

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(404).json({ status: "Failed", message: "User not found" });
    }

    var isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })

      .populate("users", "first_name last_name img ")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "first_name last_name img ",
    });

    if (isChat.length > 0) {
      res.status(200).send({ status: "Successful", chat: isChat[0] });
    } else {
      const chatData = {
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);

      const fullCreatedChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "first_name last_name img ");

      res.status(200).send({ status: "Successful", chat: fullCreatedChat });
    }
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.fetchChats = async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "first_name last_name img ")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "first_name last_name img ",
        });

        res.status(200).json({ status: "Successful", chats: results });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
