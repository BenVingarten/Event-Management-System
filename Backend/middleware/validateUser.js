import { checkSchema, body } from "express-validator";

const validFilter = ['username', 'role'];
function queryValidationSchema() {
    return {
        filter: {
            in: ['query'],
            optional: {
                options: {
                    nullable: true,
                }
            },
            custom: {
                options: (value) => {
                  return (
                    value &&
                    validFilter.some(filter => filter === value)
                  );
                },
                errorMessage: 'Filter must be included in the filter list',
            }
        }
    };
}

function createUserValidation() {
  return {
    username: {
      notEmpty: { errorMessage: "username can't be empty" },
      isLength: { options: { min: 3, max: 15 }, errorMessage: "username needs to be at range of 3 to 15 characters long" }
    },
    password: {
      notEmpty: { errorMessage: "password can't be empty" },
      isLength: { options: { min: 5, max: 20 }, errorMessage: "username needs to be at range of 5 to 20 characters long" }
    }
  };
}
function patchUserValidation() {
  return {
    username: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "username can't be empty" },
      isLength: { options: { min: 3, max: 15 }, errorMessage: "username needs to be at range of 3 to 15 characters long" }
    },
    password: {
      optional: { options: { nullable: true } },
      notEmpty: { errorMessage: "password can't be empty" },
      isLength: { options: { min: 5, max: 20 }, errorMessage: "username needs to be at range of 5 to 20 characters long" }
    }
  };
}

  export const validateCreateUser =  checkSchema(createUserValidation());
  export const validatePatchUser = checkSchema(patchUserValidation());
  export const validateUsersQuery = checkSchema(queryValidationSchema());
