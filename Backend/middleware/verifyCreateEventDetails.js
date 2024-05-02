import { eventType } from "../constants/event.js";
import { checkSchema } from "express-validator";
import isEmail from "validator";

function createEventValidation() {
  return {
    name: {
      notEmpty: { errorMessage: "event must have a name" },
    },
    date: {
      notEmpty: { errorMessage: "event's date cant be empty" },
      isDate: { errorMessage: "invalid Date" },
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
          return value.every(email => isEmail(email));
        },
        errorMessage: "Invalid email format for collaborator",
      }
    }
  };
}

export const validateCreateEvent = checkSchema(createEventValidation());
