const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    mart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mart",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who processed the sale
      required: true,
    },
    items: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }, // selling price per unit
        costPrice: { type: Number, required: true }, // cost price per unit
        subtotal: { type: Number, required: true }, // quantity * unitPrice
        profit: { type: Number, required: true }, // (unitPrice - costPrice) * quantity
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", saleSchema);
