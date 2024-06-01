import { guestStatus } from "../constants/event.js";
import { checkSchema } from "express-validator";
function isValidPhoneNumber(phoneNum) {
  const number = phoneNum.split("-");
  if (number.length !== 2) return false;

  const [part1, part2] = number;
  const part1Valid = /^05[02458]$/.test(part1);
  const part2Valid = /^\d{7}$/.test(part2);
  return part1Valid && part2Valid;
}
function addGuestValidation() {
  return {
    name: {
      notEmpty: { errorMessage: "guest must have a name" },
    },
    phoneNumber: {
      notEmpty: { errorMessage: "guest must have a phoneNumber for contact" },
      custom: {
        options: (value) => {
          return isValidPhoneNumber(value);
        },
        errorMessage: "Invalid phone number",
      },
    },
    group: {
      notEmpty: { errorMessage: "guest must have a group" },
    },
    status: {
      notEmpty: { errorMessage: "guest must have a status" },
      custom: {
        options: (value) => {
          return value && guestStatus.some((type) => type === value);
        },
        errorMessage: "Invalid guest's status",
      },
    },
    peopleCount: {
      notEmpty: {
        errorMessage:
          "guest needs to inform the number of people he is going to bring with him",
      },
      custom: {
        options: (value) => {
          return value > 0;
        },
        errorMessage: "number of guests must at least be 1",
      },
    },
  };
}

function updateGuestValidation() {
  return {
    name: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "guest must have a name" },
    },
    phoneNumber: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "guest must have a phoneNumber for contact" },
      custom: {
        options: (value) => {
          return isValidPhoneNumber(value);
        },
        errorMessage: "Invalid phone number",
      },
    },
    group: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "guest must have a group" },
    },
    status: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "guest must have a status" },
      custom: {
        options: (value) => {
          return value && guestStatus.some((type) => type === value);
        },
        errorMessage: "Invalid guest's status",
      },
    },
    peopleCount: {
      optional: { options: { nullable: true } },
      notEmpty: {
        errorMessage:
          "guest needs to inform the number of people he is going to bring with him",
      },
      custom: {
        options: (value) => {
          return value > 0;
        },
        errorMessage: "number of guests must at least be 1",
      },
    },
  };
}

export const validateAddGuest = checkSchema(addGuestValidation());
export const validateUpdateGuest = checkSchema(updateGuestValidation());
