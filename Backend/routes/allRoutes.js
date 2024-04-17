import { Router } from "express";
import registerRoute from "./register.js";
import rootRoute from "./root.js";
import usersRoute from "./users.js";
import loginRoute from "./login.js";
import refreshRoute from "./refresh.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRoles } from "../middleware/verifyRoles.js";

const router = Router();

router.use(rootRoute);
router.use(registerRoute);
router.use(loginRoute);

router.use(refreshRoute);

router.use(verifyJWT);
router.use(usersRoute);

export default router;
