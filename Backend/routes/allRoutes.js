import { Router } from "express";
import registerRoute from "./register.js";
import googleRegisterRoute from "./googleRegister.js";
import rootRoute from "./root.js";
import usersRoute from "./users.js";
import loginRoute from "./login.js";
import googleLoginRoute from "./googleLogin.js";
import refreshRoute from "./refresh.js";
import logoutRoute from "./logout.js";
import eventsRoute from "./events.js";
import tasksRoute from "./tasks.js";
import guestsRoute from "./guests.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.use(rootRoute);
router.use(googleRegisterRoute);
router.use(registerRoute);
router.use(googleLoginRoute);
router.use(loginRoute);
router.use(refreshRoute);
router.use(logoutRoute);

router.use(verifyJWT);
router.use(usersRoute);
router.use(eventsRoute);
router.use(guestsRoute);
router.use(tasksRoute);

export default router;
