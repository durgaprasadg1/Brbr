const {
  registerUser,
  verifyRegistrationOtp,
  requestLoginOtp,
  verifyLoginOtp,
} = require("./auth.service");

const {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  verifyLoginSchema,
} = require("./auth.validation");

async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);

    const result = await registerUser(
      data.name,
      data.email,
      data.role
    );

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyOtp(req, res) {
  try {
    const data = verifyOtpSchema.parse(req.body);

    const result = await verifyRegistrationOtp(
      data.email,
      data.otp
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await requestLoginOtp(
      data.email
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyLogin(req, res) {
  try {
    const data = verifyLoginSchema.parse(req.body);

    const result = await verifyLoginOtp(
      data.email,
      data.otp
    );

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

module.exports = {
  register,
  verifyOtp,
  login,
  verifyLogin,
  getMe,
  logout,
};