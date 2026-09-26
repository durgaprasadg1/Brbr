const express = require("express");

const {
  register,
  verifyOtp,
} = require("./auth.controller");

const router = express.Router();

// Register user
router.post("/register", register);

// Verify registration OTP
router.post("/verify-otp", verifyOtp);

module.exports = router;