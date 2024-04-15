import { Router } from 'express';
import { handleUserLogin } from '../Controllers/loginController.js';
const router = Router();


router.post("/login", handleUserLogin);

export default router;