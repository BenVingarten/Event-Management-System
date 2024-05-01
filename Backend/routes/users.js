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
import { verifyDesiredResourceId } from "../middleware/verifyDesiredResourceId.js";
import { verifyRoles } from "../middleware/verifyRoles.js";
import { verifyAccessToResource } from "../middleware/verifyAccessToResource.js";

const router = Router();

router
  .route("/users")
  .get(validateUsersQuery, verifyRoles("admin"), handleGetUsers);

router
  .route("/users/:id")
  .get(verifyDesiredResourceId, verifyAccessToResource, handleGetUserById)
  .patch(verifyDesiredResourceId, validatePatchUser, verifyAccessToResource, hadnlePatchUser)
  .delete(verifyDesiredResourceId, verifyAccessToResource, handleDeleteUser);

export default router;
