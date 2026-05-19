const mongoose = require("mongoose");

const profitSchema = new mongoose.Schema(
  {
    mart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mart",
      required: true,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profit", profitSchema);
