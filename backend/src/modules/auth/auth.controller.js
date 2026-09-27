const {
  registerUser,
  verifyRegistrationOtp,
  requestLoginOtp,
  verifyLoginOtp,
} = require("./auth.service");

async function register(req, res) {
  try {
    const { name, phone, role } = req.body;

    const result = await registerUser(name, phone, role);

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
    const { phone, otp } = req.body;

    const result = await verifyRegistrationOtp(phone, otp);

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
    const { phone } = req.body;

    const result = await requestLoginOtp(phone);

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
    const { phone, otp } = req.body;

    const result = await verifyLoginOtp(phone, otp);

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