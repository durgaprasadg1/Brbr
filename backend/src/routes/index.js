const express = require("express");
const authRoutes = require("./auth.routes");
const shopRoutes = require("./shop.routes");

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);
router.use("/shops", shopRoutes);

module.exports = router;
