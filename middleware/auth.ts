const jwt = require("jsonwebtoken");
const User = require("./models/User");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const user = await User.findById(decoded.id); // Find user in the database
    if (!user) return res.status(404).json({ message: "User not found." });
    req.user = user; // Attach user to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
