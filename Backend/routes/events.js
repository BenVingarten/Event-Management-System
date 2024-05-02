import { Router } from "express";
import { verifyValidResourceId } from "../middleware/verifyValidResourceId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetEvents } from "../Controllers/eventsController.js";
const router = Router();

router
  .route("/users/:id/events")
  .get(verifyValidResourceId, verifyUserIdMatchAuthId, handleGetEvents);

router
  .route("/users/:id/events/:eventId")
  .get()
  .patch()
  .delete();

export default router;
