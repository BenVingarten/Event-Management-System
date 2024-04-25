import { Router } from "express";
const router = Router();

router
  .route("/users/:userId/events")
  .get();

router
  .route("/users/:userId/events/:eventId")
  .get()
  .patch()
  .delete();

export default router;
