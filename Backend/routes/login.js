import { Router } from "express";
import handleUserLogin  from '../controllers/login.js';

const router = Router();

router.post('/', handleUserLogin);

export default router;