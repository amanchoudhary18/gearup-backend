const express = require("express");

const router = express.Router();
const ChatController = require("../controllers/chat.controller");
const userAuth = require("../middleware/userAuth");

// access chat
router.post("/accessChat", userAuth, ChatController.accessChat);

// fetch chats
router.get("/fetchChats", userAuth, ChatController.fetchChats);

module.exports = router;
