const express = require("express");
const router = express.Router();
const { verifyAppSecret } = require("./middleware/authMiddleware");

const { chatHandler } = require("./handler/chatHandler");
const { financialInsightHandler } = require("./handler/financialHandler");
const { botHandler } = require("./handler/botHandler");

// Define routes
router.post("/chat", verifyAppSecret, chatHandler);
router.post("/financial-insight", verifyAppSecret, financialInsightHandler);
router.post("/bot", verifyAppSecret, botHandler);

module.exports = router;
