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
    new_quantityPerBox: {
      type: Number,
      required: true,
      min: 1,
    },

    sellingPricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    newSellingPricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    units_To_Sell_To_StartNewPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    how_Many_Units_Were_Last_Added: {
      type: Number,
      required: true,
      min: 0,
    },
    costPricePerBox: {
      type: Number,
      required: true,
      min: 0,
    },
    new_costPricePerBox: {
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
    totalcost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    new_totalcost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
