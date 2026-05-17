const Product = require("../../models/product");
const Mart = require("../../models/MartComp");
const { productSchemaValidation } = require("../../validation/product");
const Sale = require("../../models/soldGoods");
const Profit = require("../../models/profit");

const addProduct = async (req, res) => {
  // ✅ Validate input
  const { error } = productSchemaValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  console.log("hit");

  try {
    const {
      productName,
      boxesCount,
      quantityPerBox,
      sellingPricePerUnit,
      costPricePerBox,
    } = req.body;
    const martId = req.user.mart;

    // ✅ Check if Mart exists
    const mart = await Mart.findById(martId);
    if (!mart) {
      return res.status(404).json({ message: "Mart not found" });
    }

    // ✅ Calculate derived fields
    const totalUnits = boxesCount * quantityPerBox;
    const costPerUnit = costPricePerBox / quantityPerBox;
    const profitPerUnit = sellingPricePerUnit - costPerUnit;
    const totalProfitPotential = profitPerUnit * totalUnits;

    // ✅ Create new product
    const newProduct = new Product({
      productName,
      boxesCount,
      quantityPerBox,
      sellingPricePerUnit,
      costPricePerBox,
      unitsLeft: totalUnits,
      totalProfit: totalProfitPotential,
      profitSoFar: 0,
      mart: mart._id,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: newProduct._id,
        productName: newProduct.productName,
        boxesCount: newProduct.boxesCount,
        quantityPerBox: newProduct.quantityPerBox,
        sellingPricePerUnit: newProduct.sellingPricePerUnit,
        costPricePerBox: newProduct.costPricePerBox,
        unitsLeft: newProduct.unitsLeft,
        totalProfit: newProduct.totalProfit,
        profitSoFar: newProduct.profitSoFar,
        mart: mart.name,
        createdAt: newProduct.createdAt,
      },
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Get all products
const getAllProducts = async (req, res) => {
  try {
    const martId = req.user.mart;
    const products = await Product.find({ mart: martId }).populate(
      "mart",
      "name email",
    ); // populate mart info

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products: products.map((p) => ({
        id: p._id,
        productName: p.productName,
        boxesCount: p.boxesCount,
        quantityPerBox: p.quantityPerBox,
        sellingPricePerUnit: p.sellingPricePerUnit,
        costPricePerBox: p.costPricePerBox,
        unitsLeft: p.unitsLeft,
        totalProfit: p.totalProfit,
        profitSoFar: p.profitSoFar,
        mart: p.mart?.name || "N/A",
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addSale = async (req, res) => {
  try {
    const { items } = req.body;
    const mart = req.user.mart;
    const user = req.user.id;

    if (!mart || !user || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Mart, user, and items are required" });
    }

    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      const unitPrice = product.sellingPricePerUnit;
      const costPrice = product.costPricePerBox / product.quantityPerBox;
      const subtotal = item.quantity * unitPrice;
      const profit = (unitPrice - costPrice) * item.quantity;

      processedItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        subtotal,
        profit,
      });

      // Update product stock & profitSoFar
      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            unitsLeft: -item.quantity,
            profitSoFar: profit,
          },
        },
        { returnDocument: "after" },
      );
    }

    const totalAmount = processedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const totalProfit = processedItems.reduce((sum, i) => sum + i.profit, 0);

    const newSale = new Sale({
      mart,
      user,
      items: processedItems,
      totalAmount,
      totalProfit,
    });

    await newSale.save();

    // 🔑 Update Profit table for this mart
    await Profit.findOneAndUpdate(
      { mart },
      { $inc: { totalProfit } }, // add this sale’s profit to cumulative total
      { upsert: true, new: true }, // create if not exists
    );

    res.status(201).json({
      message: "Sale recorded successfully",
      sale: newSale,
    });
  } catch (error) {
    console.error("Error saving sale:", error.message);
    res.status(500).json({ message: "Failed to save sale" });
  }
};

// Get total profit for a mart
const getTotalProfit = async (req, res) => {
  try {
    const mart = req.user.mart; // or req.params.martId if passed in URL

    if (!mart) {
      return res.status(400).json({ message: "Mart ID is required" });
    }

    const profitRecord = await Profit.findOne({ mart });

    if (!profitRecord) {
      console.log("No profit record found for this mart");
      return res
        .status(404)
        .json({ message: "No profit record found for this mart" });
    }

    res.status(200).json({
      mart: profitRecord.mart,
      totalProfit: profitRecord.totalProfit,
    });
  } catch (error) {
    console.error("Error fetching total profit:", error.message);
    res.status(500).json({ message: "Failed to fetch total profit" });
  }
};

// DELETE /api/sales/:saleId/item/:productName
const deleteSaleItem = async (req, res) => {
  try {
    const { saleId, productName } = req.params;

    // Find the sale
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Find the item to delete
    const itemToDelete = sale.items.find((i) => i.productName === productName);
    if (!itemToDelete) {
      return res.status(404).json({ message: "Item not found in sale" });
    }

    // Remove the item from the sale
    sale.items = sale.items.filter((i) => i.productName !== productName);

    // Adjust totals
    sale.totalAmount -= itemToDelete.subtotal;
    sale.totalProfit -= itemToDelete.profit;

    // Save updated sale
    await sale.save();

    // 🔑 Update Profit table (subtract this item’s profit)
    await Profit.findOneAndUpdate(
      { mart: sale.mart },
      { $inc: { totalProfit: -itemToDelete.profit } },
    );

    res.status(200).json({
      message: "Item deleted successfully",
      sale,
    });
  } catch (error) {
    console.error("Error deleting sale item:", error.message);
    res.status(500).json({ message: "Failed to delete sale item" });
  }
};

// GET /api/sales → fetch all sales records
const getSales = async (req, res) => {
  try {
    // Fetch all sales for the current mart
    const sales = await Sale.find({ mart: req.user.mart })
      .populate("user", "name email") // optional: show who processed the sale
      .sort({ createdAt: -1 }); // latest first

    res
      .status(200)
      .json({ message: "Sale recorded successfully", sales: sales });
  } catch (error) {
    console.error("Error fetching sales:", error.message);
    res.status(500).json({ message: "Failed to fetch sales records" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  addSale,
  deleteSaleItem,
  getSales,
  getTotalProfit,
};
