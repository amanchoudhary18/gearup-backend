const express = require("express");

const router = express.Router();
const MessageController = require("../controllers/message.controller");
const userAuth = require("../middleware/userAuth");

// send message
router.post("/sendMessage", userAuth, MessageController.sendMessage);

// get messages
router.get("/getMessages/:id", userAuth, MessageController.getMessages);

module.exports = router;
