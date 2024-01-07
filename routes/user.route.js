const express = require("express");
const userAuth = require("../middleware/userAuth");
const router = express.Router();
const UserController = require("../controllers/user.controller");

// sign up route
router.post("/register", UserController.register);

// otp verification
router.post("/otp_verification", UserController.otpverification);

// update details
router.post("/update", userAuth, UserController.update);

// get mydata
router.get("/mydata", userAuth, UserController.mydata);

// get nearby players
router.get("/getPlayers", userAuth, UserController.getPlayers);

router.get("/getFilteredPlayers", userAuth, UserController.getFilteredPlayers);

// logout
router.post("/logout", userAuth, UserController.logout);

// // delete otp
// router.get("/delete-otp", UserController.deleteInactiveOtps);

module.exports = router;
