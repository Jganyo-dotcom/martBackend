const Joi = require("joi");

const productSchemaValidation = Joi.object({
  productName: Joi.string().min(2).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters",
  }),
  boxesCount: Joi.number().integer().min(1).required().messages({
    "number.base": "Boxes count must be a number",
    "number.min": "Boxes count must be at least 1",
  }),
  quantityPerBox: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity per box must be a number",
    "number.min": "Quantity per box must be at least 1",
  }),
  sellingPricePerUnit: Joi.number().min(0).required().messages({
    "number.base": "Selling price must be a number",
    "number.min": "Selling price cannot be negative",
  }),
  costPricePerBox: Joi.number().min(0).required().messages({
    "number.base": "Cost price must be a number",
    "number.min": "Cost price cannot be negative",
  }),
});
module.exports = { productSchemaValidation };
