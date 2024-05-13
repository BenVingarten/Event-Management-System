import { Router } from "express";
const router = Router();

router
  .route("/users/:id/events/:eventId/guests")
  .get()
  .post();
    

  router
    .route("/users/:id/events/:eventId/guests/:guestId")
    .get()
    .patch()
    .put()
    .delete();
    
export default router;
