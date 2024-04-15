import { Router } from "express";
import rootRoute from './root.js';
import registerRoute from './register.js';
import loginRoute from './login.js';
import refreshRoute from './refresh.js';
import logoutRoute from './logout.js';
import { verifyJWT } from "../middleware/verifyJWT.js";
import usersRoute from './users.js';


const router = Router();

router.use('/', rootRoute);
router.use('/register', registerRoute);
router.use('/login', loginRoute);
router.use('/refresh', refreshRoute);
router.use('/logout', logoutRoute);
router.use(verifyJWT);

router.use('/users', usersRoute);


export default router;