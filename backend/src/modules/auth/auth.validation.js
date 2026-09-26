const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),

  role: z
    .enum(["CUSTOMER", "OWNER"])
    .default("CUSTOMER"),
});

const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),

  otp: z
    .string()
    .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
});

const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
};