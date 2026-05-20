const authmiddleware = (req, res, next) => {
  const token = req.cookies.authToken?.replace(/^"|"$/g, "");
  console.log("Raw cookie value:", req.cookies.authToken);
  console.log("First char:", req.cookies.authToken.charAt(0));
  console.log(
    "Last char:",
    req.cookies.authToken.charAt(req.cookies.authToken.length - 1),
  );

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authmiddleware;
