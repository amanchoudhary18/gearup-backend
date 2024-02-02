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
      .populate({
        path: "users",
        select: "first_name last_name img",
        options: {
          transform: function (doc) {
            doc.name = (doc.first_name + " " + doc.last_name).trim();
            delete doc.first_name;
            delete doc.last_name;
            return doc;
          },
        },
      })
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "first_name last_name img ",
    });
    if (isChat.length > 0) {
      const chatData = isChat[0];

      const chat = {
        ...chatData._doc,
        sender: chatData.users.filter(
          (user) => user._id == String(req.user._id)
        )[0],
        receiver: chatData.users.filter((user) => user._id == userId)[0],
      };

      delete chat.users;

      res.status(200).send({ status: "Successful", chat });
    } else {
      const chatData = {
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);

      const fullCreatedChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "first_name last_name img ");

      const fullChatData = fullCreatedChat;

      const chat = {
        ...fullChatData._doc,
        sender: fullChatData.users.filter(
          (user) => user._id == String(req.user._id)
        )[0],
        receiver: fullChatData.users.filter((user) => user._id == userId)[0],
      };

      delete chat.users;

      res.status(200).send({ status: "Successful", chat });
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
      .populate({
        path: "users",
        select: "first_name last_name img",
        options: {
          transform: function (doc) {
            doc.name = (doc.first_name + " " + doc.last_name).trim();
            delete doc.first_name;
            delete doc.last_name;
            return doc;
          },
        },
      })
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "first_name last_name img ",
          options: {
            transform: function (doc) {
              doc.name = (doc.first_name + " " + doc.last_name).trim();
              delete doc.first_name;
              delete doc.last_name;
              return doc;
            },
          },
        });

        const modifiedResults = results.map((result) => {
          const modifiedResult = {
            ...result._doc,
            sender: result.users.filter(
              (user) => user._id == String(req.user._id)
            )[0],
            receiver: result.users.filter(
              (user) => user._id != String(req.user._id)
            )[0],
          };

          delete modifiedResult.users;
          return modifiedResult;
        });

        res.status(200).json({ status: "Successful", chats: modifiedResults });
      });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
