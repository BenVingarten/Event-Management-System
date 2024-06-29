import { checkSchema } from "express-validator";
import { rolesEnum, validFilter } from "../constants/user.js";
function queryValidationSchema() {
  return {
    filter: {
      in: ["query"],
      optional: {
        options: {
          nullable: true,
        },
      },
      custom: {
        options: (values) => {
          if (!Array.isArray(values)) return false;
          return values.every((value) => validFilter.includes(value));
        },
        errorMessage: "Filter must be included in the filter list",
      },
    },
  };
}

function createUserValidation() {
  return {
    username: {
      notEmpty: { errorMessage: "username can't be empty" },
      isLength: {
        options: { min: 3, max: 15 },
        errorMessage:
          "username needs to be at range of 3 to 15 characters long",
      },
    },
    email: {
      notEmpty: { errorMessage: "email cant be empty" },
      isEmail: { errorMessage: "invalid email format" },
    },
    password: {
      notEmpty: { errorMessage: "password can't be empty" },
      isLength: {
        options: { min: 5, max: 20 },
        errorMessage:
          "username needs to be at range of 5 to 20 characters long",
      },
      custom: {
        options: (value) => {
          if (value && /[a-z]/.test(value) && /[A-Z]/.test(value)) return true;
        },
        errorMessage:
          "passowrd must contain at least 1 uppercase and lowercase letters",
      },
    },
    role: {
      custom: {
        options: (value) => {
          return value && rolesEnum.some((role) => role === value);
        },
        errorMessage: "role must be Event Planner/Vendor",
      },
    },
    businessName: {
      optional: true,
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and businessType is provided
          return (
            req.body.role !== "Vendor" || (req.body.role === "Vendor" && value)
          );
        },
        errorMessage: "Business Name is required for vendors",
      },
    },
    businessType: {
      optional: true,
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and businessType is provided
          return (
            req.body.role !== "Vendor" || (req.body.role === "Vendor" && value)
          );
        },
        errorMessage: "Business type is required for vendors",
      },
    },
    businessLocation: {
      optional: true,
      isArray: { errorMessage: "locations needs to be sent as an array" },
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and location is provided
          return (
            req.body.role !== "Vendor" || (req.body.role === "Vendor" && value)
          );
        },
        errorMessage: "Location is required for vendors",
      },
    },
    businessDescription: {
      optional: true,
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and description is provided
          return (
            req.body.role !== "Vendor" || (req.body.role === "Vendor" && value)
          );
        },
        errorMessage: "Description is required for vendors",
      },
    },
  };
}
function patchUserValidation() {
  return {
    username: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "username can't be empty" },
      isLength: {
        options: { min: 3, max: 15 },
        errorMessage:
          "username needs to be at range of 3 to 15 characters long",
      },
    },
    email: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "email cant be empty" },
      isEmail: { errorMessage: "invalid email format" },
    },
    businessName: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and businessType is provided
          return req.role !== "Vendor" || (req.role === "Vendor" && value);
        },
        errorMessage: "businessName is required for vendors",
      },
    },
    businessType: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and businessType is provided
          return req.role !== "Vendor" || (req.role === "Vendor" && value);
        },
        errorMessage: "Business type is required for vendors",
      },
    },
    businessLocation: {
      optional: { options: { nullable: true } },
      isArray: { errorMessage: "locations needs to be sent as an array" },
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and location is provided
          return req.role !== "Vendor" || (req.role === "Vendor" && value);
        },
        errorMessage: "Location is required for vendors",
      },
    },
    businessDescription: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value, { req }) => {
          // Check if role is Vendor and description is provided
          return req.role !== "Vendor" || (req.role === "Vendor" && value);
        },
        errorMessage: "Description is required for vendors",
      },
    },
  };
}

export const validateCreateUser = checkSchema(createUserValidation());
export const validatePatchUser = checkSchema(patchUserValidation());
export const validateUsersQuery = checkSchema(queryValidationSchema());
