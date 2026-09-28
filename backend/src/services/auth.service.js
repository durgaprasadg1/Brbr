const UserModel = require("../models/user.model");
const { sendOtp, verifyOtp } = require("./otp.service");
const { generateToken } = require("../utils/jwt");

class AuthService {
  static async registerUser(name, email, role = "CUSTOMER") {
    const normalizedEmail = email.trim().toLowerCase();

    if (!["CUSTOMER", "OWNER", "ADMIN"].includes(role)) {
      throw new Error("Invalid registration role");
    }

    const existingUser = await UserModel.findByEmail(normalizedEmail);

    if (existingUser) {
      if (existingUser.is_verified) {
        throw new Error("User already registered with this email");
      }

      // Existing user but not yet verified -> Resend OTP
      await sendOtp(normalizedEmail);

      return {
        message: "OTP resent successfully to your email.",
        userId: existingUser.id,
      };
    }

    // Create new unverified user record
    const insertId = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      role,
    });

    await sendOtp(normalizedEmail);

    return {
      message: "Registration successful. OTP sent to your email.",
      userId: insertId,
    };
  }

  /**
   * Verify registration OTP and issue JWT
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<{ user: object, token: string, message: string }>}
   */
  static async verifyRegistrationOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();

    const otpResult = await verifyOtp(normalizedEmail, otp);
    if (!otpResult.success) {
      throw new Error(otpResult.message);
    }

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_deleted) {
      throw new Error("User account has been deleted");
    }

    if (!user.is_active) {
      throw new Error("User account is inactive");
    }

    // Mark account as verified
    await UserModel.verifyUser(normalizedEmail);

    // Refresh user state
    const updatedUser = await UserModel.findByEmail(normalizedEmail);

    const token = generateToken({
      id: updatedUser.id,
      role: updatedUser.role,
    });

    return {
      message: "Registration successful and verified",
      token,
      user: updatedUser,
    };
  }

  static async requestLoginOtp(email) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error(
        "No account found with this email. Please register first.",
      );
    }

    if (user.is_deleted) {
      throw new Error("User account has been deleted");
    }

    if (!user.is_active) {
      throw new Error("User account is inactive. Please contact support.");
    }

    if (!user.is_verified) {
      throw new Error(
        "User account is not verified. Please complete registration verification.",
      );
    }

    await sendOtp(normalizedEmail);

    return {
      message: "Login OTP sent successfully to your email.",
    };
  }

  static async verifyLoginOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_deleted) {
      throw new Error("User account has been deleted");
    }

    if (!user.is_active) {
      throw new Error("User account is inactive");
    }

    if (!user.is_verified) {
      throw new Error("User account is not verified");
    }

    const otpResult = await verifyOtp(normalizedEmail, otp);
    if (!otpResult.success) {
      throw new Error(otpResult.message);
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return {
      message: "Login successful",
      token,
      user,
    };
  }

  static async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user || user.is_deleted) {
      throw new Error("User not found or deleted");
    }
    return user;
  }
}

module.exports = AuthService;
