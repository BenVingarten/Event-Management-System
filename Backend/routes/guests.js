import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { validateAddGuest, validatePathchGuest } from "../middleware/verifyGuestDetails.js";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { handleAddGuest, handleGetGuests, handleGetGuest, handlePatchGuest, handlePutGuest, handleDeleteGuest } from "../Controllers/guestsController.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/guests")
  .get(verifyUserIdMatchAuthId, verifyParamId('eventId'), handleGetGuests)
  .post(verifyUserIdMatchAuthId, verifyParamId('eventId'), validateAddGuest, handleAddGuest);
    

  router
    .route("/users/:id/events/:eventId/guests/:guestId")
    .get(verifyUserIdMatchAuthId, verifyParamId('eventId'), verifyParamId('guestId'), handleGetGuest)
    .patch(verifyUserIdMatchAuthId, verifyParamId('eventId'), verifyParamId('guestId'), validatePathchGuest, handlePatchGuest)
    .put(verifyUserIdMatchAuthId, verifyParamId('eventId'), verifyParamId('guestId'), handlePutGuest)
    .delete(verifyUserIdMatchAuthId, verifyParamId('eventId'), verifyParamId('guestId'), handleDeleteGuest);
    
export default router;
