const jwt = require('jsonwebtoken');
const { User } = require("../modules/user/model/user.model");
require('dotenv').config();

exports.authenticateManager = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    // Verify the token using the secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECERET);
    const user = await User.findById(decoded.userId);  // Use userId as set in the login token payload

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    console.log("-------------------->",user)
    if (user.roles !== 2) {
      return res.status(403).json({ error: "Forbidden: You are not an Manager" });
    }
 
    req.user = user;  // Attach the user to the request object
    next();
  } catch (err) {
    console.error("Authentication error:", err);  // Log the error for debugging
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
