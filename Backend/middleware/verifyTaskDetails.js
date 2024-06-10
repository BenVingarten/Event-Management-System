import { taskStatus } from "../constants/event.js";
import { checkSchema } from "express-validator";
function putTaskValidation() {
  return {
    cards: {
      custom: {
        options: (value) => {
          return Array.isArray(value);
        },
        errorMessage: "cards must be an array",
      },
    },
    "cards.*.title": {
      notEmpty: {
        errorMessage: "Task must have content",
      },
    },
    "cards.*.column": {
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
function createTaskValidation() {
  return {
    'newCard.title': {
      notEmpty: {
        errorMessage: "Task must have content",
      },
    },
    'newCard.column': {
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

export const validatePutTask = checkSchema(putTaskValidation());
export const validateCreateTask = checkSchema(createTaskValidation());
