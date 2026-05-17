const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    boxesCount: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityPerBox: {
      type: Number,
      required: true,
      min: 1,
    },
    sellingPricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    costPricePerBox: {
      type: Number,
      required: true,
      min: 0,
    },
    unitsLeft: {
      type: Number,
      required: true,
      min: 0,
    },
    totalProfit: {
      type: Number,
      required: true,
      min: 0,
    },
    profitSoFar: {
      type: Number,
      required: true,
      min: 0,
    },
    mart: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Mart", // reference the Mart model
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
