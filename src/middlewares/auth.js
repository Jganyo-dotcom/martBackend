const authmiddleware = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const cleanToken = token.trim();
    
    // 🔑 Hardcode the exact same string here
    const decoded = jwt.verify(cleanToken, "TEMPORARY_TEST_SECRET_12345"); 
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Verification failed for token:", token);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authmiddleware