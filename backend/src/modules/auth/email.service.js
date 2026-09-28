const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: `"Barber Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Barber Shop OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Barber Shop</h2>
        <p>Your verification OTP is:</p>

        <h1 style="letter-spacing: 6px;">${otp}</h1>

        <p>This OTP is valid for <strong>5 minutes</strong>.</p>

        <p>Please do not share this OTP with anyone.</p>
      </div>
    `,
  });

  console.log(`OTP email sent to ${email}`);
}

module.exports = {
  sendOtpEmail,
};