import { checkSchema } from "express-validator";

const validFilter = ['username', 'email', 'password'];


export const usersQueryValidationSchema = {
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


function userValidationSchema(optionalFields = []) {
    return {
      username: {
        ...(optionalFields.includes('username') ? { optional: { options: { nullable: true } } } : {}),
        notEmpty: { errorMessage: "username can't be empty" },
        isLength: { options: { min: 3, max: 15 }, errorMessage: "username needs to be at range of 3 to 15 characters long" },
      },
      email: {
        ...(optionalFields.includes('email') ? { optional: { options: { nullable: true } } } : {}),
        notEmpty: { errorMessage: "email can't be empty" },
        isEmail: { errorMessage: "email must have a valid email format" },
      },
      password: {
        ...(optionalFields.includes('password') ? { optional: { options: { nullable: true } } } : {}),
        notEmpty: { errorMessage: "password can't be empty" },
        isLength: { options: { min: 5, max: 20 }, errorMessage: "password needs to be at range of 5 to 20 characters long" }
      }
    };
  }
  
  export const createUserValidationSchema =  checkSchema(userValidationSchema());
  export const updateUserValidationSchema = checkSchema(userValidationSchema(['username', 'email', 'password']));
  
