const Joi = require("joi");

// Registration validation
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

// Login validation
const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Username or Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const registerMartSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
  }),
  addresse: Joi.string().min(4).required().messages({
    "string.empty": "Password is required",
    "string.min": "addresse must be at least 4 characters",
  }),
});



const userSchemaValidation = Joi.object({
  username: Joi.string().min(2).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 2 characters",
  }),
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),
  contact: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/) // allows +233..., or 10–15 digits
    .required()
    .messages({
      "string.empty": "Contact number is required",
      "string.pattern.base":
        "Contact must be a valid phone number (e.g. +233XXXXXXXXX)",
    }),
  mart: Joi.string().messages({
    "string.empty": "Mart ID is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  role: Joi.string().valid("superior manager", "admin", "user").default("user"),
});



const passwordChangeSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().messages({
    "string.empty": "Old password is required",
    "string.min": "Old password must be at least 6 characters",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 8 characters",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  registerMartSchema,
  userSchemaValidation,
  passwordChangeSchema,
  userSchemaValidation,
};
