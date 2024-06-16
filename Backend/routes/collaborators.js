import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId";
import { validateAddCollaborator } from "../middleware/verifyEventDetails";
import { handleAddCollaborator, handleDeleteCollaborator  } from "../Controllers/collaboratorController";

const router = Router();

router.route("/users/:id/events/:eventId/collaborators")
.post(verifyUserIdMatchAuthId, verifyParamId('eventId'), validateAddCollaborator, handleAddCollaborator);

router.route("/users/:id/events/:eventId/collaborators/:email")
.delete(verifyUserIdMatchAuthId, verifyParamId('eventId'), handleDeleteCollaborator);