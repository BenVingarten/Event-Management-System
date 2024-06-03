import { eventType } from "../constants/event.js";
import { checkSchema } from "express-validator";
import validator from "validator";

function createEventValidation() {
  return {
    name: {
      notEmpty: { errorMessage: "event must have a name" },
    },
    date: {
      notEmpty: { errorMessage: "event's date cant be empty" },
    },
    type: {
      notEmpty: { errorMessage: "event must have a type" },
      custom: {
        options: (value) => {
          return value && eventType.some((type) => type === value);
        },
        errorMessage: "Invalid event's type",
      },
    },
    budget: {
      isDecimal: { errorMessage: "budget must be Decimal" },
      notEmpty: { errorMessage: "budget cant be empty" },
    },
    location: {
      notEmpty: { errorMessage: "event must have a location" },
    },
    collaborators: {
      custom: {
        options: (value) => {
          if (!Array.isArray(value)) return false;
          return value.every((email) => validator.isEmail(email));
        },
        errorMessage: "Invalid email format for collaborator",
      },
    },
  };
}

function patchEventValidation() {
  return {
    name: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "event must have a name" },
    },
    date: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "event's date cant be empty" },
    },
    type: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "event must have a type" },
      custom: {
        options: (value) => {
          return value && eventType.some((type) => type === value);
        },
        errorMessage: "Invalid event's type",
      },
    },
    budget: {
      optional: { options: { nullable: true } },
      isDecimal: { errorMessage: "budget must be Decimal" },
      notEmpty: { errorMessage: "budget cant be empty" },
    },
    location: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "event must have a location" },
    },
    collaborators: {
      optional: { options: { nullable: true } },
      isArray: { errorMessage: "collaborators needs to be sent as an array" },
      custom: {
        options: (value) => {
          return (!value.every((email) => validator.isEmail(email)));

        },
        errorMessage: "Invalid email format for collaborator",
      },
    },
    additionalInfo: {
      optional: { options: { nullable: true } },
      isArray: { errorMessage: "additionalInfo needs to be sent as an array" },
      },
  }
}

export const validateCreateEvent = checkSchema(createEventValidation());
export const validatePathchEvent = checkSchema(patchEventValidation());