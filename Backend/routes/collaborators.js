import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { validateAddCollaborator } from "../middleware/verifyEventDetails.js";
import {
  handleAddCollaborator,
  handleDeleteCollaborator,
} from "../Controllers/collaboratorController.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";

const router = Router();

router
  .route("/users/:id/events/:eventId/collaborators")
  .post(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    validateAddCollaborator,
    handleAddCollaborator
  )
  .delete(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    handleDeleteCollaborator
  );

export default router;
