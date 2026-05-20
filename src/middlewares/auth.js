const authmiddleware = (req, res, next) => {
  let token = req.cookies.authToken;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // 🔑 THE FIX: Ensure any browser URL encoding is stripped away
    const cleanToken = decodeURIComponent(token).trim();

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Verification failed for token:", token); // 👈 See exactly what the backend sees
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports= authmiddleware