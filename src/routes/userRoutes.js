const express = require("express");
const router = express.Router();
const { loginUser } = require("../controller/users/user");

// Registration endpoint
// router.post("/register", validate(registerSchema), registerUser);

// Login endpoint
router.post("/login", loginUser);

module.exports = router;
