import { checkSchema } from "express-validator";
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
        errorMessage: "Invalid email format for collaborator",
      },
    },
    businessType: {
      notEmpty: { errorMessage: "vendor name cant be empty" },
    },
  };
}
export const validateCreateVendor = checkSchema(createVendorValidation());
