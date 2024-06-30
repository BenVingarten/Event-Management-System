import { checkSchema } from "express-validator";
import validator from "validator";
function createVendorValidation() {
  return {
    name: {
      notEmpty: { errorMessage: "vendor name cant be empty" },
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
      notEmpty: { errorMessage: "vendor name cant be empty" },
    },
  };
}
export const validateCreateVendor = checkSchema(createVendorValidation());
