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
    status: {
      notEmpty: { errorMessage: "guest must have a status" },
      custom: {
        options: (value) => {
          return value && guestStatus.some((type) => type === value);
        },
        errorMessage: "Invalid guest's status",
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
  };
}

export const validateAddGuest = checkSchema(addGuestValidation());
export const validateUpdateGuest = checkSchema(updateGuestValidation());
