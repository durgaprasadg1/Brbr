const { redisClient } = require("../config/redis");
const { sendOtpEmail } = require("./email.service");

const OTP_EXPIRY = 5 * 60; // 5 minutes in seconds

function getOtpKey(email) {
  return `otp:${email.trim().toLowerCase()}`;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate, cache in Redis, and send OTP
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function sendOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  const key = getOtpKey(normalizedEmail);

  // Store OTP in Redis with 5 minute expiration
  await redisClient.set(key, otp, {
    EX: OTP_EXPIRY,
  });

  // Send OTP (email or dev log)
  await sendOtpEmail(normalizedEmail, otp);

  return true;
}

/**
 * Verify OTP against Redis cache
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function verifyOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  const key = getOtpKey(normalizedEmail);

  const storedOtp = await redisClient.get(key);

  if (!storedOtp) {
    return {
      success: false,
      message: "OTP not found or expired. Please request a new one.",
    };
  }

  if (storedOtp !== otp.trim()) {
    return {
      success: false,
      message: "Invalid OTP. Please check the code and try again.",
    };
  }

  // Delete OTP after successful verification to prevent replay
  await redisClient.del(key);

  return {
    success: true,
    message: "OTP verified successfully.",
  };
}

module.exports = {
  sendOtp,
  verifyOtp,
};
