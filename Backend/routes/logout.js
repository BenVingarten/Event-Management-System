import { Router } from "express";
import { handleLogout } from "../Controllers/logoutController.js";

const router = Router();
router.get("/logout", handleLogout);

export default router;
