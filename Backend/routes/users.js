import { Router } from "express";
import {
  handleGetUserById,
  handleGetUsers,
  hadnlePatchUser,
  handleDeleteUser,
} from "../Controllers/userController.js";
import {
  validatePatchUser,
  validateUsersQuery,
} from "../middleware/validateUser.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";

const router = Router();

router
  .route("/users")
  .get(validateUsersQuery, verifyRoles("Admin"), handleGetUsers);

router
  .route("/users/:id")
  .get(verifyUserIdMatchAuthId, handleGetUserById)
  .patch(verifyUserIdMatchAuthId, validatePatchUser, hadnlePatchUser)
  .delete(verifyUserIdMatchAuthId, handleDeleteUser);

export default router;
