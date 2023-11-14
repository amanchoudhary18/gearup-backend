const User = require("../models/user.model");
const generateOTP = require("../utils/generateOTP");
const OtpModel = require("../models/otp.model");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const referralCodeGenerator = require("referral-code-generator");

//register function
exports.register = async (req, res) => {
  const { mobileNumber, country } = req.body;
  try {
    const otp = generateOTP(4);
    const otpModel = {
      otp: otp,
      status: true,
      mobileNumber,
      country,
    };

    const otpDb = new OtpModel(otpModel);
    const otpsave = await otpDb.save();

    setTimeout(async () => {
      const otpupdate = await OtpModel.findOneAndUpdate(
        { _id: otpsave._id },
        { otp: otp, status: false }
      );
    }, 100000);

    res.status(200).send({
      status: "Successful",
      message: "otp sent",
      otpId: otpsave._id,
    });
  } catch (error) {
    console.error(error);
    res.status(200).send({
      status: "Failed",
      message: "Failed to send OTP",
    });
  }
};

// otp-verification
exports.otpverification = async (req, res) => {
  try {
    const otp = req.body.otpEntered;
    const otpId = req.body.otpId;
    const otpDB = await OtpModel.findById(otpId);
    const mobileNumber = otpDB.mobileNumber;
    const country = otpDB.country;

    if (otpDB.otp == otp && otpDB.status) {
      const existingUser = await User.findOne({ mobileNumber });

      if (existingUser) {
        const token = await existingUser.generateAuthToken();
        res.status(200).send({
          status: "Successful",
          user: existingUser,
          token,
        });
      } else {
        let referralCode;
        let isReferralCodeUnique = false;

        while (!isReferralCodeUnique) {
          referralCode = referralCodeGenerator.alphaNumeric("uppercase", 3, 3);

          const existingUserWithReferralCode = await User.findOne({
            referral_code: referralCode,
          });

          if (!existingUserWithReferralCode) {
            isReferralCodeUnique = true;
          }
        }
        const user = new User({
          mobileNumber,
          country,
          referral_code: referralCode,
        });
        await user.save();
        const token = await user.generateAuthToken();
        res.status(200).send({
          status: "Successful",
          user,
          token,
        });
      }
    }
  } catch (error) {
    res.status(500).send({ status: "Failed", message: "Wrong OTP entered" });
  }
};

// Update User
exports.update = async (req, res) => {
  const allowedFields = [
    "favorite_sports",
    "objective",
    "play_time",
    "first_name",
    "last_name",
    "birthday",
    "gender",
    "addresses",
  ];

  const updateFields = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
  );

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    Object.assign(user, updateFields);
    user.new_user = false;
    await user.save();

    res.status(200).send({ status: "Successful", user });
  } catch (error) {
    res.status(500).send({ status: "Failed", message: error.message });
  }
};
