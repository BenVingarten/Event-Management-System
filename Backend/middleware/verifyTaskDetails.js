import { taskStatus } from "../constants/event.js";
import { checkSchema } from "express-validator";
import { tasksFilters } from "../constants/event.js";

function createTaskValidation() {
  return {
    content: {
      notEmpty: { errorMessage: "task must have a content" },
    },
    status: {
      notEmpty: { errorMessage: "event must have a type" },
      custom: {
        options: (value) => {
          return value && taskStatus.some((type) => type === value);
        },
        errorMessage: "Invalid task's status",
      },
    },
    priority: {
      notEmpty: { errorMessage: "task must have a priority" },
      isDecimal: { errorMessage: "priority must be a Number" },
    },
  };
}

function queryTasksSchema() {
  return {
    filter: {
      in: ["query"],
      optional: {
        options: {
          nullable: true,
        },
      },
      notEmpty: { errorMessage: "filter cant be empty" },
      custom: {
        options: (value) => {
          return value && tasksFilters.some((filter) => filter === value);
        },
        errorMessage: "Filter must be included in the filter list",
      },
    },
  };
}

// function patchEventValidation() {
//   return {
//     name: {
//       optional: { options: { nullable: true } },
//       notEmpty: { errorMessage: "event must have a name" },
//     },
//     date: {
//       optional: { options: { nullable: true } },
//       notEmpty: { errorMessage: "event's date cant be empty" },
//     },
//     type: {
//       optional: { options: { nullable: true } },
//       notEmpty: { errorMessage: "event must have a type" },
//       custom: {
//         options: (value) => {
//           return value && eventType.some((type) => type === value);
//         },
//         errorMessage: "Invalid event's type",
//       },
//     },
//     budget: {
//       optional: { options: { nullable: true } },
//       isDecimal: { errorMessage: "budget must be Decimal" },
//       notEmpty: { errorMessage: "budget cant be empty" },
//     },
//     location: {
//       optional: { options: { nullable: true } },
//       notEmpty: { errorMessage: "event must have a location" },
//     },
//   }
// }

export const validateCreateTask = checkSchema(createTaskValidation());
export const validateQueryTasks = checkSchema(queryTasksSchema());
