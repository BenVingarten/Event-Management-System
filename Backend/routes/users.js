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
import { verifyValidResourceId} from "../middleware/verifyValidResourceId.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";

const router = Router();

router
  .route("/users")
  .get(validateUsersQuery, verifyRoles("admin"), handleGetUsers);

router
  .route("/users/:id")
  .get(verifyValidResourceId, verifyUserIdMatchAuthId, handleGetUserById)
  .patch(verifyValidResourceId, validatePatchUser, verifyUserIdMatchAuthId, hadnlePatchUser)
  .delete(verifyValidResourceId, verifyUserIdMatchAuthId, handleDeleteUser);

export default router;
