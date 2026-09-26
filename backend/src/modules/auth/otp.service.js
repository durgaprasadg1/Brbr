const otpStore = new Map();

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp(phone) {
  const otp = generateOtp();

  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY,
  });

  console.log(`OTP for ${phone}: ${otp}`);

  return true;
}

function verifyOtp(phone, otp) {
  const storedOtp = otpStore.get(phone);

  if (!storedOtp) {
    return {
      success: false,
      message: "OTP not found or expired",
    };
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStore.delete(phone);

    return {
      success: false,
      message: "OTP expired",
    };
  }

  if (storedOtp.otp !== otp) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  otpStore.delete(phone);

  return {
    success: true,
    message: "OTP verified successfully",
  };
}

module.exports = {
  sendOtp,
  verifyOtp,
};