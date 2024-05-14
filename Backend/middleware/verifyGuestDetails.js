import { guestStatus } from "../constants/event";

function addGuestValidation() {
    return {
      name: {
        optional: isUpdate,
        notEmpty: { errorMessage: "guest must have a name" },
      },
      phoneNumber: {
        notEmpty: { errorMessage: "guest must have a phoneNumber for contact" },
        custom: {
            options: (value) => {
              const num = value.split('-');
              if(num.length !== 2 || num[0].length !== 3 || num[1].length !== 7)
                return false;
              const regexPrefix = '/^05[0245]/';
              return regexPrefix.test(num[0]);
            },
            errorMessage: "Invalid phone number",
          }
      },
      status: {
        notEmpty: { errorMessage: "guest must have a status" },
        custom: {
          options: (value) => {
            return value && guestStatus.some((type) => type === value);
          },
          errorMessage: "Invalid guest's status",
        }
      },
    };
  }
  
  
  
  export const validateCreateEvent = checkSchema(createEventValidation());
  export const validatePathchEvent = checkSchema(patchEventValidation());