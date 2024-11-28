const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "No user found for this token." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ error: "Token has expired. Please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid token. Access denied." });
    }

    res
      .status(500)
      .json({ error: "Authentication failed due to a server error." });
  }
};

module.exports = authenticate;
