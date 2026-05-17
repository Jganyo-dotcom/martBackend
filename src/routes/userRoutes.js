const express = require("express");
const router = express.Router();
const {
  loginUser,
  addMart,
  addUserToMart,
  changePassword,
  getMarts,
} = require("../controller/users/user");
const authmiddleware = require("../middlewares/auth");

// Registration endpoint
// router.post("/register", validate(registerSchema), registerUser);

// Login endpoint
router.post("/login", loginUser);

router.post("/add-mart", addMart); //add mart

router.get("/get-marts", getMarts); //get all mart

router.post("/add-admin/:martId",  addUserToMart); //add user or admin

router.post("/change-password/:userId", authmiddleware, changePassword); //change password

module.exports = router;
