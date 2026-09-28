const { redisClient } = require("../../common/redis/client");
const { sendOtpEmail } = require("./email.service");

const OTP_EXPIRY = 5 * 60; // 5 minutes

function getOtpKey(email) {
  return `otp:${email}`;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email) {
  const otp = generateOtp();
  const key = getOtpKey(email);

  // Store OTP in Redis for 5 minutes
  await redisClient.set(key, otp, {
    EX: OTP_EXPIRY,
  });

  // Send OTP to user's email
  await sendOtpEmail(email, otp);

  return true;
}

async function verifyOtp(email, otp) {
  const key = getOtpKey(email);

  const storedOtp = await redisClient.get(key);

  if (!storedOtp) {
    return {
      success: false,
      message: "OTP not found or expired",
    };
  }

  if (storedOtp !== otp) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  // Delete OTP after successful verification
  await redisClient.del(key);

  return {
    success: true,
    message: "OTP verified successfully",
  };
}

module.exports = {
  sendOtp,
  verifyOtp,
};