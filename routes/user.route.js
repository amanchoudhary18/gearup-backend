const express = require("express");
const userAuth = require("../middleware/userAuth");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const multer = require("multer");

const storage = multer.memoryStorage();

// below variable is define to check the type of file which is uploaded
const filefilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// defining the upload variable for the configuration of photo being uploaded
const upload = multer({ storage: storage, fileFilter: filefilter });

// sign up route
router.post("/register", UserController.register);

// otp verification
router.post("/otp_verification", UserController.otpverification);

// update details
router.post("/update", userAuth, upload.single("file"), UserController.update);

// get mydata
router.get("/mydata", userAuth, UserController.mydata);

// get nearby players
router.post("/getPlayers", userAuth, UserController.getPlayers);

// get any player
router.get("/getAnyPlayer/:id", userAuth, UserController.getAnyPlayer);

// logout
router.post("/logout", userAuth, UserController.logout);

// // delete otp
// router.get("/delete-otp", UserController.deleteInactiveOtps);

module.exports = router;
