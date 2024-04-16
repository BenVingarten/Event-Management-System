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
import { getUserId } from "../middleware/getUserId.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { verifyAccessToResource } from "../middleware/verifyAccessToResource.js";

const router = Router();

router
  .route("/users")
  .get(validateUsersQuery, verifyRoles(["admin"]), handleGetUsers);

router
  .route("/users/:id")
  .get(getUserId, verifyAccessToResource, handleGetUserById)
  .patch(getUserId, validatePatchUser, verifyAccessToResource, hadnlePatchUser)
  .delete(getUserId, verifyAccessToResource, handleDeleteUser);

export default router;
