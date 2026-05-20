const authmiddleware = (req, res, next) => {
  const token = req.cookies.authToken?.replace(/^"|"$/g, "");

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("token in");
    console.log(token);
    console.log(req.cookies);
    next();
  } catch (err) {
    console.log("no token");
    console.log(token);
    console.log(req.cookies);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authmiddleware;
