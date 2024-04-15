import { Router } from "express";
import { handleRegister } from "../Controllers/registerController.js";
import { validateCreateUser } from "../middleware/validateUser.js";
const router = Router();

router.post('/register', validateCreateUser, handleRegister);

export default router;


