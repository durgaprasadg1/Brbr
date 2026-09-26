const pool = require("../../config/db");
const { sendOtp } = require("./otp.service");

async function registerUser(name, phone, role = "CUSTOMER") {
  // Check if user already exists
  const [existingUsers] = await pool.execute(
    "SELECT id, is_verified FROM users WHERE phone = ? LIMIT 1",
    [phone]
  );

  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];

    if (existingUser.is_verified) {
      throw new Error("User already registered");
    }

    // Existing but not verified → resend OTP
    sendOtp(phone);

    return {
      message: "OTP resent successfully",
      userId: existingUser.id,
    };
  }

  // Create new unverified user
  const [result] = await pool.execute(
    `INSERT INTO users
      (name, phone, role, is_verified, is_active, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, FALSE, TRUE, FALSE, NOW(), NOW())`,
    [name, phone, role]
  );

  // Send OTP
  sendOtp(phone);

  return {
    message: "Registration successful. OTP sent.",
    userId: result.insertId,
  };
}

module.exports = {
  registerUser,
};
const { verifyOtp } = require("./otp.service");

async function verifyRegistrationOtp(phone, otp) {
  // Verify OTP
  const otpResult = verifyOtp(phone, otp);

  if (!otpResult.success) {
    throw new Error(otpResult.message);
  }

  // Check user
  const [users] = await pool.execute(
    `SELECT id, name, phone, role, is_verified, is_active, is_deleted
     FROM users
     WHERE phone = ?
     LIMIT 1`,
    [phone]
  );

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  if (user.is_deleted) {
    throw new Error("User account has been deleted");
  }

  if (!user.is_active) {
    throw new Error("User account is inactive");
  }

  // Mark user as verified
  await pool.execute(
    `UPDATE users
     SET is_verified = TRUE,
         updated_at = NOW()
     WHERE phone = ?`,
    [phone]
  );

  return {
    message: "OTP verified successfully",
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_verified: true,
    },
  };
}