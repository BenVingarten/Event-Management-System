import { Router } from "express";
import usersController from "../controllers/users.js";
import ROLES_LIST from "../config/roles_list.js";
import { verifyRoles } from "../middleware/verifyRoles.js";

const router = Router();
router.use(verifyRoles(ROLES_LIST.Admin), usersController);

export default router;

