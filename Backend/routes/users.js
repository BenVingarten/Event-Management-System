import { Router } from "express";
import { handleGetUserById, handleGetUsers, hadnlePatchUser, handleDeleteUser } from "../Controllers/userController.js";
import { validatePatchUser, validateUsersQuery } from "../middleware/validateUser.js";
import { getUserId } from '../middleware/getUserId.js';


const router = Router();

router.route('/users')
    .get(validateUsersQuery , handleGetUsers)


router.route("/users/:id")
    .get(getUserId, handleGetUserById)
    .patch(getUserId, validatePatchUser, hadnlePatchUser)
    .delete(getUserId, handleDeleteUser);



export default router;