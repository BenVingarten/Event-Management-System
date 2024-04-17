import { Router } from "express";
import { handleUserGoogleLogin } from "../Controllers/googleLoginController.js";
const router = Router();

router.post("/google/login", handleUserGoogleLogin);

export default router;
