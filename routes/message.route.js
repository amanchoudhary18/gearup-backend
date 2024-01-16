const express = require("express");

const router = express.Router();
const MessageController = require("../controllers/message.controller");
const userAuth = require("../middleware/userAuth");

// create sports
router.post("/sendMessage", userAuth, MessageController.sendMessage);

// get sports
router.get("/getMessages/:chatId", userAuth, MessageController.getMessages);

module.exports = router;
