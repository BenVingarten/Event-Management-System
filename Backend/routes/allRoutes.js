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
import invitesRoute from "./invitations.js";
import collaboratorsRoute from "./collaborators.js";
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
router.use(invitesRoute);
router.use(eventsRoute);
router.use(collaboratorsRoute);
router.use(tasksRoute);
router.use(guestsRoute);

export default router;
