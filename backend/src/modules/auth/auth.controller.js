const {
  registerUser,
  verifyRegistrationOtp,
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

module.exports = {
  register,
  verifyOtp,
};