const Connection = require("../models/connection.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

exports.sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const existingRequest = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Request already sent" });
    }

    const newConnectionRequest = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      sentDate: Date.now(),
    });

    const receiver = await User.findOne({ _id: receiverId });

    const notification = await Notification.create({
      sender: senderId,
      content: `${req.user.first_name} has sent you a connection request`,
      type: "Sent Connection Request",
    });

    receiver.notifications.push(notification);
    await receiver.save();

    res
      .status(201)
      .json({ status: "Success", connectionRequest: newConnectionRequest });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.getConnectionRequests = async (req, res) => {
  try {
    const receiverId = req.user._id;

    const connectionRequests = await Connection.find({
      receiver: receiverId,
      status: "Pending",
    })
      .populate("sender", "first_name last_name")
      .exec();

    res.status(200).json({ status: "Success", connectionRequests });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.acceptConnectionRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.body.senderId;

    const connectionRequest = await Connection.findOneAndUpdate(
      {
        sender: senderId,
        receiver: receiverId,
        status: "Pending",
      },
      { $set: { status: "Accepted" } },
      { new: true }
    ).populate("sender", "_id");

    if (!connectionRequest) {
      return res.status(404).json({
        status: "Failed",
        message: "Request not found or already responded",
      });
    }

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { connections: connectionRequest.sender._id },
    });

    await User.findByIdAndUpdate(connectionRequest.sender._id, {
      $addToSet: { connections: receiverId },
    });

    const sender = await User.findOne({ _id: senderId });

    const notification = await Notification.create({
      sender: receiverId,
      content: `${req.user.first_name} has accepted your connection request`,
      type: "Accepted Connection Request",
    });

    sender.notifications.push(notification);
    await sender.save();

    res.status(200).json({ status: "Success", connectionRequest });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.rejectConnectionRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.body.senderId;

    const deletedConnection = await Connection.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "Pending",
    });

    if (!deletedConnection) {
      return res.status(404).json({
        status: "Failed",
        message: "Request not found or already responded",
      });
    }

    res
      .status(200)
      .json({ status: "Success", message: "Connection request rejected" });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};

exports.removeConnection = async (req, res) => {
  try {
    const userId = req.user._id;
    const connectionUserId = req.body.connectionUserId;

    console.log(userId, connectionUserId);
    const connection = await Connection.findOne({
      $or: [
        { sender: userId, receiver: connectionUserId },
        { sender: connectionUserId, receiver: userId },
      ],
    });

    if (!connection) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Connection not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { connections: connectionUserId },
    });
    await User.findByIdAndUpdate(connectionUserId, {
      $pull: { connections: userId },
    });

    await Connection.findByIdAndDelete(connection._id);

    res.status(200).json({ status: "Success", message: "Connection removed" });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: error.message });
  }
};
