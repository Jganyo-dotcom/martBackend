const express = require("express");
const {
  addProduct,
  getAllProducts,
  addSale,
  deleteSaleItem,
  getSales,
  getTotalProfit,
  deleteItem,
} = require("../controller/procducts/product");
const authmiddleware = require("../middlewares/auth");
const router = express.Router();

router.post("/add-product", authmiddleware, addProduct); //add mart
router.get("/get-products", authmiddleware, getAllProducts); //add mart
router.post("/add-sale", authmiddleware, addSale); //add sale
router.get("/sales", authmiddleware, getSales); //
router.get("/profit", authmiddleware, getTotalProfit); //
router.delete("/delete-product/:itemId", authmiddleware, deleteItem); //delete sale
router.delete(
  "/sales/:saleId/item/:productName",
  authmiddleware,
  deleteSaleItem,
);

module.exports = router;
