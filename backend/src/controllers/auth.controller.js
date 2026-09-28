const AuthService = require("../services/auth.service");
const {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  verifyLoginSchema,
} = require("../validations/auth.validation");

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    is_verified: Boolean(user.is_verified),
    created_at: user.created_at,
  };
}

class AuthController {
  static async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.registerUser(
        data.name,
        data.email,
        data.role,
      );

      return res.status(201).json({
        success: true,
        message: result.message,
        userId: result.userId,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req, res, next) {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyRegistrationOtp(
        data.email,
        data.otp,
      );

      // Set HTTP-only JWT cookie
      res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

      return res.status(200).json({
        success: true,
        message: result.message,
        token: result.token,
        user: formatUser(result.user),
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.requestLoginOtp(data.email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle login OTP verification
   */
  static async verifyLogin(req, res, next) {
    try {
      const data = verifyLoginSchema.parse(req.body);
      const result = await AuthService.verifyLoginOtp(data.email, data.otp);

      // Set HTTP-only JWT cookie
      res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

      return res.status(200).json({
        success: true,
        message: result.message,
        token: result.token,
        user: formatUser(result.user),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated user profile
   */
  static async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: "Current user profile retrieved",
        user: formatUser(req.user),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out user and clear cookie
   */
  static async logout(req, res, next) {
    try {
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
