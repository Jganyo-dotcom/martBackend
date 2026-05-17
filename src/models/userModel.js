const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    contact: {
      type: String,
      required: true,
      minlength: 3,
    },
    mart: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Mart",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // enforce strong passwords
    },
    role: {
      type: String,
      required: true,
      enum: ["superior manager", "admin", "user"],
      default: "admin",
    },
    hasChangedPassword: {
      type: Boolean,
      required: true,
      default: false, // enforce strong passwords
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
