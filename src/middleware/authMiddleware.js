const verifyAppSecret = (req, res, next) => {
  const clientSecret = req.headers["x-app-secret"];
  const serverSecret = process.env.APP_SECRET;

  if (!clientSecret || clientSecret !== serverSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing x-app-secret header.",
    });
  }
  next();
};

module.exports = { verifyAppSecret };
