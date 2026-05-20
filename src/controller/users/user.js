const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Mart = require("../../models/MartComp");
const { compareData, hashData } = require("../../utils/hash");
const {
  loginSchema,
  registerMartSchema,
  userSchemaValidation,
  passwordChangeSchema,
} = require("../../validation/user");

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).populate("mart", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await compareData(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, mart: user.mart, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRES_IN },
    );

    // Set cookie only
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true, // false in dev
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Respond without token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        mart: user.mart.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addMart = async (req, res) => {
  try {
    const { name, addresse, email } = req.body;
    const { error } = registerMartSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Basic validation
    if (!name || !addresse || !email) {
      return res
        .status(400)
        .json({ message: "Name, address, and email are required" });
    }

    // Check if Mart already exists
    const existingMart = await Mart.findOne({ email });
    if (existingMart) {
      return res
        .status(409)
        .json({ message: "Mart with this email already exists" });
    }

    // Create new Mart
    const newMart = new Mart({
      name,
      addresse,
      email,
      isPremium: false,
    });

    await newMart.save();

    res.status(201).json({
      message: "Mart created successfully",
      mart: {
        id: newMart._id,
        name: newMart.name,
        addresse: newMart.addresse,
        email: newMart.email,
        isPremium: newMart.isPremium,
        createdAt: newMart.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating Mart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addUserToMart = async (req, res) => {
  //  Validate request body
  const { error } = userSchemaValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { username, name, contact, email, password, role } = req.body;
    console.log(req.params.martId);
    const martId = req.params.martId;

    // ✅ Check if Mart exists
    const mart = await Mart.findById(martId);
    if (!mart) {
      return res.status(404).json({ message: "Mart not found" });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // ✅ Hash password
    hashedPassword = await hashData(password);

    // ✅ Create new user
    const newUser = new User({
      username,
      name,
      contact,
      mart: mart._id,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User added to Mart successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        contact: newUser.contact,
        email: newUser.email,
        role: newUser.role,
        mart: mart.name,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const changePassword = async (req, res) => {
  // ✅ Validate input
  const { error } = passwordChangeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Verify old password
    const isMatch = await compareData(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // ✅ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await hashData(newPassword);

    // ✅ Update user password
    user.password = hashedPassword;
    user.hasChangedPassword = true;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET all marts
const getMarts = async (req, res) => {
  try {
    const marts = await Mart.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ marts });
  } catch (error) {
    console.error("Error fetching marts:", error.message);
    res.status(500).json({ message: "Failed to fetch marts" });
  }
};

module.exports = {
  loginUser,
  addMart,
  addUserToMart,
  changePassword,
  getMarts,
};
