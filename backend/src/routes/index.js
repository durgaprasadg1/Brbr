const express = require("express");
const authRoutes = require("./auth.routes");

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

module.exports = router;
