const express = require("express");
const router = express.Router();
const ConnectionController = require("../controllers/connection.controller");
const userAuth = require("../middleware/userAuth");

// Send connection request
router.post(
  "/sendRequest",
  userAuth,
  ConnectionController.sendConnectionRequest
);

// Get connection requests for the logged-in user
router.get("/requests", userAuth, ConnectionController.getConnectionRequests);

// Accept connection request
router.post(
  "/acceptRequest",
  userAuth,
  ConnectionController.acceptConnectionRequest
);

// Reject connection request
router.post(
  "/rejectRequest",
  userAuth,
  ConnectionController.rejectConnectionRequest
);

// Remove connection
router.post(
  "/removeConnection",
  userAuth,
  ConnectionController.removeConnection
);

module.exports = router;
