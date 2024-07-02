import { checkSchema } from "express-validator";
import validator from "validator";
import { vendorStatus } from "../constants/event.js";
function createCustomVendorValidation() {
  return {
    businessName: {
      notEmpty: { errorMessage: "vendor businessName cant be empty" },
    },
    email: {
      notEmpty: { errorMessage: "vendor email cant be empty" },
      custom: {
        options: (value) => {
          return validator.isEmail(value);
        },
        errorMessage: "Invalid email format for vendor",
      },
    },
    businessType: {
      notEmpty: { errorMessage: "vendor businessType cant be empty" },
    },
    priceForService: {
      notEmpty: { errorMessage: "the price cant be empty" },
      custom: {
        options: (value) => {
          return value && value > 0;
        },
        errorMessage: "price cant be negative",
      },
    },
  };
}

function updateCustomVendorValidation() {
  return {
    businessName: {
      optional: { options: { nullalbe: true } },
      notEmpty: { errorMessage: "vendor businessName cant be empty" },
    },
    email: {
      optional: { options: { nullalbe: true } },
      notEmpty: { errorMessage: "vendor email cant be empty" },
      custom: {
        options: (value) => {
          return validator.isEmail(value);
        },
        errorMessage: "Invalid email format for vendor",
      },
    },
    businessType: {
      optional: { options: { nullalbe: true } },
      notEmpty: { errorMessage: "vendor businessType cant be empty" },
    },
    priceForService: {
      optional: { options: { nullalbe: true } },
      notEmpty: { errorMessage: "the price cant be empty" },
      custom: {
        options: (value) => {
          return value && value > 0;
        },
        errorMessage: "price cant be negative",
      },
    },
  };
}

function updateRegisteredVendorValidation() {
  return {
    priceForService: {
      custom: {
        options: (value, { req }) => {
          return value && value > 0;
        },
        errorMessage: "Price must be greater than 0",
      },
    },
  };
}
export const validateCreateCustomVendor = checkSchema(
  createCustomVendorValidation()
);
export const validateUpdateCustomVendor = checkSchema(
  updateCustomVendorValidation()
);
export const validateUpdateRegisteredVendor = checkSchema(
  updateRegisteredVendorValidation()
);
