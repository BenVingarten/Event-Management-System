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
function updateVendorValidation() {
  return {
    "newCard.title": {
      notEmpty: {
        errorMessage: "Task must have content",
      },
    },
    "newCard.column": {
      notEmpty: {
        errorMessage: "Task must have a status",
      },
      custom: {
        options: (value) => value && taskStatus.includes(value),
        errorMessage: "Invalid task status",
      },
    },
  };
}

export const validateupdateTask = checkSchema(putTaskValidation());
export const validateCreateVendor = checkSchema(createVendorValidation());
