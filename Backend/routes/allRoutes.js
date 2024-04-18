import { Router } from "express";
import registerRoute from "./register.js";
import googleRegisterRoute from "./googleRegister.js";
import rootRoute from "./root.js";
import usersRoute from "./users.js";
import loginRoute from "./login.js";
import googleLoginRoute from "./googleLogin.js";
import refreshRoute from "./refresh.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.use(rootRoute);
router.use(googleRegisterRoute);
router.use(registerRoute);
router.use(googleLoginRoute);
router.use(loginRoute);
router.use(refreshRoute);

router.use(verifyJWT);
router.use(usersRoute);

export default router;
