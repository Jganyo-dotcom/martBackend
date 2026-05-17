const mongoose = require("mongoose");

const Martchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    addresse: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    isPremium: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mart", Martchema);
