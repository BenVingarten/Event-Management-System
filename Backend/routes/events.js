import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  handleGetEvents,
  handleCreateEvent,
  handleGetEventById,
  handleDeleteEvent
} from "../Controllers/eventsController.js";
import { validateCreateEvent } from "../middleware/verifyCreateEventDetails.js";
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
.patch()
.delete(verifyUserIdMatchAuthId, verifyEventId, handleDeleteEvent);

export default router;
