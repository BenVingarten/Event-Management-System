import { eventType } from "../constants/event.js";
import { checkSchema } from "express-validator";
import validator from "validator";
import { locations } from "../constants/event.js";

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
      custom: {
        options: (value, req) => {
          return locations.some((location) => location === value);
        },
        errorMessage: "location is invalid",
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
      custom: {
        options: (value, req) => {
          return locations.some((location) => location === value);
        },
        errorMessage: "location is invalid",
      },
    },
    additionalInfo: {
      optional: { options: { nullable: true } },
      isArray: { errorMessage: "additionalInfo needs to be sent as an array" },
      //notEmpty: { errorMessage: "cant add an empty additional info" },
    },
  };
}

function postCollaboratorValidation() {
  return {
    email: {
      custom: {
        options: (value) => {
          return validator.isEmail(value);
        },
        errorMessage: "Invalid email format for collaborator",
      },
    },
  };
}

export const validateCreateEvent = checkSchema(createEventValidation());
export const validatePathchEvent = checkSchema(patchEventValidation());
export const validateAddCollaborator = checkSchema(
  postCollaboratorValidation()
);
