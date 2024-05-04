import { Router } from "express";
import { verifyValidResourceId } from "../middleware/verifyValidResourceId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  handleGetEvents,
  handleCreateEvent,
} from "../Controllers/eventsController.js";
import { validateCreateEvent } from "../middleware/verifyCreateEventDetails.js";

const router = Router();

router
  .route("/users/:id/events")
  .get(verifyValidResourceId, verifyUserIdMatchAuthId, handleGetEvents)
  .post(
    verifyValidResourceId,
    verifyUserIdMatchAuthId,
    validateCreateEvent,
    handleCreateEvent
  );

router.route("/users/:id/events/:eventId").get().patch().delete();

export default router;
