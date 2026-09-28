const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send OTP via the configured email provider
 * @param {string} email
 * @param {string} otp
 */
async function sendOtpEmail(email, otp) {
  if (!transporter) {
    console.error("Email service is not configured.");
    const error = new Error(
      "Email service is not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env.",
    );
    error.statusCode = 503;
    throw error;
  }

  try {
    await transporter.sendMail({
      from: `"Barber Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Barber Shop OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">TrimQ / Barber Shop</h2>
          <p style="color: #475569;">Your verification OTP is:</p>
          <h1 style="letter-spacing: 6px; color: #1e293b; background: #f8fafc; padding: 12px 18px; border-radius: 6px; display: inline-block;">${otp}</h1>
          <p style="color: #64748b;">This OTP is valid for <strong>5 minutes</strong>.</p>
          <p style="color: #94a3b8; font-size: 13px;">Please do not share this OTP with anyone.</p>
        </div>
      `,
    });
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error("Nodemailer failed to send email:", error.message);
    const deliveryError = new Error(
      "The verification email could not be sent. Check the email service configuration and try again.",
    );
    deliveryError.statusCode = 503;
    throw deliveryError;
  }
}

module.exports = {
  sendOtpEmail,
};
