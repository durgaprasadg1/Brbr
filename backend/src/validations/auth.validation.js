const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(255, "Email cannot exceed 255 characters"),

  role: z.enum(["CUSTOMER", "OWNER", "ADMIN"]).default("CUSTOMER"),
});

const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),

  otp: z
    .string({ required_error: "OTP is required" })
    .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
});

const verifyLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),

  otp: z
    .string({ required_error: "OTP is required" })
    .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  verifyLoginSchema,
};
