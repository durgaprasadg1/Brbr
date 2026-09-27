const express = require("express");

const {
  register,
  verifyOtp,
  login,
  verifyLogin,
  getMe,
  logout,
} = require("./auth.controller");

const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

// Registration
router.post("/register", register);

// Registration OTP verification
router.post("/verify-otp", verifyOtp);

// Login OTP request
router.post("/login", login);

// Login OTP verification + JWT cookie
router.post("/login/verify", verifyLogin);

// Protected current-user endpoint
router.get("/me", authenticate, getMe);

// Logout
router.post("/logout", logout);

module.exports = router;