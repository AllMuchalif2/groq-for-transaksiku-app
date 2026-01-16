const dotenv = require("dotenv");
// Load env vars
dotenv.config();

const express = require("express");
const cors = require("cors");
const { homeHandler } = require("./handler/homeHandler");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route - Documentation
app.get("/", homeHandler);

// Use Routes
app.use("/api", routes);

// Server startup implementation
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

module.exports = app;
