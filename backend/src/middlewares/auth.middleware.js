const { verifyToken } = require("../utils/jwt");
const UserModel = require("../models/user.model");

async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.token;

    // Also support Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = verifyToken(token);

    // Fetch fresh user profile from database
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.is_deleted || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account not found or has been deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
}

module.exports = {
  authenticate,
};
