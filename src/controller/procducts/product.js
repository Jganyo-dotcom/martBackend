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
      totalcost,
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
    const Totalcost = boxesCount * costPricePerBox;
    console.log(Totalcost);

    // ✅ Create new product
    const newProduct = new Product({
      productName,
      boxesCount,
      quantityPerBox,
      sellingPricePerUnit,
      costPricePerBox,
      unitsLeft: totalUnits,
      totalProfit: totalProfitPotential,
      totalcost: Totalcost,
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
    const { items, customerName } = req.body;
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
      const expense = product.totalcost;

      processedItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        subtotal,
        profit,
        expense,
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

    const totalAmount = processedItems.reduce((sum, i) => sum + i.subtotal, 0); // the total amount not profit
    const totalProfit = processedItems.reduce((sum, i) => sum + i.profit, 0);
    const totalCost = processedItems.reduce(
      (sum, i) => sum + i.costPrice * i.quantity,
      0,
    );

    const newSale = new Sale({
      mart,
      user,
      items: processedItems,
      totalAmount,
      totalProfit,
      customerName,
    });

    await newSale.save();

    // 🔑 Update Profit table for this mart
    await Profit.findOneAndUpdate(
      { mart },
      {
        $inc: {
          totalProfit, // add this sale’s profit
          totalCost, // add this sale’s cost
        },
      },
      { upsert: true, new: true }, // create if not exists, return updated doc
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
      totalexpense: profitRecord.totalCost,
    });
  } catch (error) {
    console.error("Error fetching total profit:", error.message);
    res.status(500).json({ message: "Failed to fetch total profit" });
  }
};

// controllers/productController.js

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // ✅ Find product
    const product = await Product.findById(itemId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Delete product itself
    await Product.findByIdAndDelete(itemId);

    // ✅ Cascade delete: remove product from any sales that referenced it
    await Sale.updateMany(
      { "items.productId": itemId },
      {
        $pull: { items: { productId: itemId } },
      },
    );

    res.status(200).json({
      message: "Product and related sale records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = { deleteItem };

// DELETE /api/sales/:saleId/item/:productName
const deleteSaleItem = async (req, res) => {
  try {
    const { saleId, productName } = req.params;
    const { inputer, quantity } = req.body; // extra safety checks

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(200).json({ message: "Sale not found" });
    console.log(sale.items);
    // Find the item by productName, inputer, and quantity
    const itemToDelete = sale.items.find(
      (i) => i.productName === productName && i.quantity === quantity,
    );

    if (!itemToDelete) {
      return res.status(200).json({ message: "Item not found in sale" });
    }

    // Remove item
    sale.items = sale.items.filter(
      (i) => !(i.productName === productName && i.quantity === quantity),
    );

    // Adjust totals
    sale.totalAmount -= itemToDelete.subtotal;
    sale.totalProfit -= itemToDelete.profit;

    await sale.save();

    // 🔑 Update Profit table (subtract this item’s profit and cost)
    await Profit.findOneAndUpdate(
      { mart: sale.mart },
      {
        $inc: {
          totalProfit: -itemToDelete.profit,
          totalCost: -(itemToDelete.costPrice * itemToDelete.quantity),
        },
      },
    );

    // Update the product stock and profit after deleting the sale item
    await Product.findByIdAndUpdate(itemToDelete.productId, {
      $inc: {
        unitsLeft: itemToDelete.quantity, // restore stock
        profitSoFar: -itemToDelete.profit, // remove profit contribution
        totalProfit: -itemToDelete.profit, // adjust product-level profit
        totalcost: -(itemToDelete.costPrice * itemToDelete.quantity), // adjust product-level cost
      },
    });
    console.log(itemToDelete.quantity);

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

const getProductById = async (req, res) => {
  const id = req.params.productId;
  const mart = req.user.mart;
  const product = await Product.find({ _id: id, mart: mart });
  if (product.length === 0) {
    return res.status(200).json({ message: "requested item not found" });
  }

  res.status(200).json({ message: "your product", product });
};

// Controller: add packs and update units
const addPacks = async (req, res) => {
  const { productId } = req.params;
  const { packsToAdd } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update packs count
    product.boxesCount += packsToAdd;

    // Update units left (packs * items per pack)
    product.unitsLeft += packsToAdd * product.quantityPerBox;

    await product.save();

    res.json(product);
  } catch (err) {
    console.error("Error adding packs:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  addSale,
  deleteItem,
  getSales,
  getTotalProfit,
  deleteSaleItem,
  getProductById,
  addPacks,
};
