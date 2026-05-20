const authmiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // 🔑 read cookie
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("token in")
    next();
  } catch (err) {
    console.log("no token")
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authmiddleware
