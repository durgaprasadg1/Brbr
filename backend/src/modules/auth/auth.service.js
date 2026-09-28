const pool = require("../../config/db");

const { sendOtp, verifyOtp } = require("./otp.service");
const { generateToken } = require("../../../utils/jwt");

async function registerUser(name, email, role = "CUSTOMER") {
  if (!["CUSTOMER", "OWNER"].includes(role)) {
    throw new Error("Invalid registration role");
  }

  // Check if email already exists
 
  const [existingUsers] = await pool.execute(
    `SELECT id, name, email, role, is_verified
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];

    if (existingUser.is_verified) {
      throw new Error("User already registered");
    }

    // Existing but not verified → resend OTP
    await sendOtp(email);

    return {
      message: "OTP resent successfully to your email",
      userId: existingUser.id,
    };
  }

  // Create new unverified user
  const [result] = await pool.execute(
    `INSERT INTO users
      (name, email, role, is_verified, is_active, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, FALSE, TRUE, FALSE, NOW(), NOW())`,
    [name, email, role]
  );

  await sendOtp(email);

  return {
    message: "Registration successful. OTP sent to your email.",
    userId: result.insertId,
  };
}

async function verifyRegistrationOtp(email, otp) {
  const otpResult = await verifyOtp(email, otp);

  if (!otpResult.success) {
    throw new Error(otpResult.message);
  }

  const [users] = await pool.execute(
    `SELECT id, name, email, role, is_verified, is_active, is_deleted
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
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

  await pool.execute(
    `UPDATE users
     SET is_verified = TRUE,
         updated_at = NOW()
     WHERE email = ?`,
    [email]
  );

  return {
    message: "OTP verified successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: true,
    },
  };
}

async function requestLoginOtp(email) {
  const [users] = await pool.execute(
    `SELECT id, name, email, role, is_verified, is_active, is_deleted
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
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

  if (!user.is_verified) {
    throw new Error("User is not verified");
  }

  await sendOtp(user.email);

  return {
    message: "Login OTP sent successfully to your email",
  };
}

async function verifyLoginOtp(email, otp) {
  const [users] = await pool.execute(
    `SELECT id, name, email, role, is_verified, is_active, is_deleted
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
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

  if (!user.is_verified) {
    throw new Error("User is not verified");
  }

  const otpResult = await verifyOtp(user.email, otp);

  if (!otpResult.success) {
    throw new Error(otpResult.message);
  }

  const token = generateToken(user);

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  registerUser,
  verifyRegistrationOtp,
  requestLoginOtp,
  verifyLoginOtp,
};