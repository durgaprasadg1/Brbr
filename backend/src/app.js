const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);

module.exports = app;