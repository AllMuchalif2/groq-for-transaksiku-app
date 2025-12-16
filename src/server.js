const dotenv = require("dotenv");
// Load env vars
dotenv.config();

const express = require("express");
const cors = require("cors");
const { verifyAppSecret } = require("./middleware/authMiddleware");
const { chatHandler } = require("./handler/chatHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/chat", verifyAppSecret, chatHandler);

// Server startup implementation
if (require.main === module) {
  // Only start listening if this file is run directly (not imported)
  // This allows Vercel or tests to import 'app' without starting the server automatically
  // BUT the user specificied "src/server.js" is what is run.
  // In production (Vercel), usually it looks for exports.
  // However, for local 'node src/server.js', this block runs.

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

module.exports = app;
