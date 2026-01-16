const express = require("express");
const router = express.Router();
const { verifyAppSecret } = require("./middleware/authMiddleware");

const { botHandler } = require("./handler/botHandler");

// Define routes
router.post("/bot", verifyAppSecret, botHandler);

module.exports = router;
