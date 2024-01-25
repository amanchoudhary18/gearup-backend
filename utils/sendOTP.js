const { default: axios } = require("axios");

async function sendOtp(otp, number) {
  console.log(number);
  const smsBody = {
    apikey: "dZ5RYJ9ro4sfjVes",
    senderid: "MTAMOI",
    number: `+91${number}`,
    message: `Your OTP - One Time Password is ${otp} to authenticate your login with ${number}\n\nThanks, Gearup`,
    format: "json",
  };
  try {
    const response = await axios.post("https:/msgn.mtalkz.com/api", smsBody);
    console.log(response.data);
  } catch (error) {
    console.log(error);
    throw new Error("OTP failed. Please retry");
  }
}

module.exports = sendOtp;
