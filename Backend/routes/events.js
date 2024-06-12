import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  handleGetEvents,
  handleCreateEvent,
  handleGetEventById,
  handleDeleteEvent,
  handlePatchEvent,
} from "../Controllers/eventsController.js";
import {
  validateCreateEvent,
  validatePathchEvent,
} from "../middleware/verifyEventDetails.js";
import { verifyParamId } from "../middleware/verifyParamId.js";

const router = Router();

router
  .route("/users/:id/events")
  .get(verifyUserIdMatchAuthId, handleGetEvents)
  .post(verifyUserIdMatchAuthId, validateCreateEvent, handleCreateEvent);

router
  .route("/users/:id/events/:eventId")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetEventById)
  .patch(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    validatePathchEvent,
    handlePatchEvent
  )
  .delete(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleDeleteEvent);

export default router;
