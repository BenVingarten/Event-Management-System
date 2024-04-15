import { Router } from "express";
import { handleRefresh } from "../Controllers/refreshController.js";

const router = Router();

router.get('/refresh', handleRefresh);

export default router;


