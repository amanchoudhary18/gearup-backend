const express = require("express");
const userAuth = require("../middleware/userAuth");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const multer = require("multer");
const User = require("../models/user.model");
const BuckTransaction = require("../models/buckTransaction.model");

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

// verify-referral-code
router.post("/verifyReferralCode", userAuth, UserController.verifyReferralCode);

// fetchNotifications
router.get("/notifications", userAuth, UserController.fetchNotifications);

// fetchBucksTransactions
router.get("/bucksTransactions", userAuth, async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch transactions for the user and populate the 'bucks' field
    const transactions = await BuckTransaction.find({ user: userId }).populate(
      "buckId"
    );

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// // delete otp
// router.get("/delete-otp", UserController.deleteInactiveOtps);

module.exports = router;
