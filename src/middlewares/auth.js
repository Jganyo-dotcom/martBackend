const jwt = require("jsonwebtoken");

const authmiddleware = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // const cleanToken = token.trim();

    // 🔑 Hardcode the exact same string here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT ERROR TYPE:", err.name); // Will print "JsonWebTokenError" or "TokenExpiredError"
    console.error("JWT ERROR REASON:", err.message); // Will print the exact reason, like "malformed token"
    return res.status(403).json({ message: "Invalid tokenN OH" });
  }
};

module.exports = authmiddleware;
