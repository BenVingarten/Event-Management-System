import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  handleGetEvents,
  handleCreateEvent,
  handleGetEventById,
  handleDeleteEvent,
  handlePatchEvent
} from "../Controllers/eventsController.js";
import { validateCreateEvent, validatePathchEvent } from "../middleware/verifyEventDetails.js";
import { verifyEventId } from "../middleware/VerifyEventId.js";


const router = Router();

router
  .route("/users/:id/events")
  .get(verifyUserIdMatchAuthId, handleGetEvents)
  .post(
    verifyUserIdMatchAuthId,
    validateCreateEvent,
    handleCreateEvent
  );

router.route("/users/:id/events/:eventId")
.get(verifyUserIdMatchAuthId, verifyEventId, handleGetEventById)
.patch(verifyUserIdMatchAuthId, verifyEventId, validatePathchEvent, handlePatchEvent)
.delete(verifyUserIdMatchAuthId, verifyEventId, handleDeleteEvent);

export default router;
