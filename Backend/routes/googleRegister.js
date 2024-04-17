import { Router } from "express";
import { handleUserGoogleRegister } from "../Controllers/googleRegisterController.js";
const router = Router();

router.post("/google/register", handleUserGoogleRegister);

export default router;
