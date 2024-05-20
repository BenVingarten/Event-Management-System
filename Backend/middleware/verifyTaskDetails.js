import { taskStatus } from "../constants/event.js";
import { checkSchema } from "express-validator";
function putTaskValidation() {
  return {
    taskList: {
      isArray: {
        errorMessage: 'TaskList must be an array',
      },
    },
    'taskList.*.content': {
      notEmpty: {
        errorMessage: 'Task must have content',
      },
    },
    'taskList.*.status': {
      notEmpty: {
        errorMessage: 'Task must have a status',
      },
      custom: {
        options: (value) => value && taskStatus.includes(value),
        errorMessage: 'Invalid task status',
      },
    },
    'taskList.*.priority': {
      notEmpty: {
        errorMessage: 'Task must have a priority',
      },
      isNumeric: {
        errorMessage: 'Priority must be a number',
      },
    }
  };
}

export const validatePutTask = checkSchema(putTaskValidation());
