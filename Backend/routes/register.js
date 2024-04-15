import { Router } from "express";
import { createUserValidationSchema } from "../middleware/validateUser.js";
import  handleUserRegister from '../controllers/register.js';


const router = Router();

router.post('/', createUserValidationSchema, handleUserRegister);

export default router;