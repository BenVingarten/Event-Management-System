import { checkSchema } from "express-validator";
import validator from "validator";
function createVendorValidation() {
  return {
    businnessName: {
      notEmpty: { errorMessage: "vendor buinessName cant be empty" },
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
      notEmpty: { errorMessage: "vendor businessType cant be empty" },
      custom: {
        options: (value) => {
          return value && value > 0;
        },
        errorMessage: "price cant be negative"
      }
    }
  };
}
export const validateCreateVendor = checkSchema(createVendorValidation());
