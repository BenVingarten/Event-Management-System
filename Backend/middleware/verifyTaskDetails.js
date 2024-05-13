import { taskStatus } from "../constants/event.js";
import { checkSchema } from "express-validator";
function putTaskValidation() {
  return {
    "tasks.*.content": {
      notEmpty: { errorMessage: "task must have a content" },
    },
    "tasks.*.status": {
      notEmpty: { errorMessage: "event must have a type" },
      custom: {
        options: (value) => {
          return value && taskStatus.some((type) => type === value);
        },
        errorMessage: "Invalid task's status",
      },
    },
    "tasks.*.priority": {
      notEmpty: { errorMessage: "task must have a priority" },
      isDecimal: { errorMessage: "priority must be a Number" },
    },
  };
}

export const validatePutTask = checkSchema(putTaskValidation());
