const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// Registration
router.post("/register", AuthController.register);
// Registration OTP verification
router.post("/verify-otp", AuthController.verifyOtp);
// Login OTP request
router.post("/login", AuthController.login);
// Login OTP verification
router.post("/login/verify", AuthController.verifyLogin);
// Protected current-user endpoint
router.get("/me", authenticate, AuthController.getMe);
router.get(
	"/admin/users",
	authenticate,
	authorizeRoles("ADMIN"),
	AuthController.getAdminUsers,
);
// Logout
router.post("/logout", AuthController.logout);

module.exports = router;
