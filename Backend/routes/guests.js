import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  validateAddGuest,
  validateUpdateGuest,
} from "../middleware/verifyGuestDetails.js";
import { verifyParamId } from "../middleware/verifyParamId.js";
import {
  handleAddGuest,
  handleGetGuests,
  handleGetGuest,
  handlePatchGuest,
  handlePutGuest,
  handleDeleteGuests,
} from "../Controllers/guestsController.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/guests")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetGuests)
  .post(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    validateAddGuest,
    handleAddGuest
  )
  .delete(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    handleDeleteGuests
  );

router
  .route("/users/:id/events/:eventId/guests/:guestId")
  .get(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    verifyParamId("guestId"),
    handleGetGuest
  )
  .patch(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    verifyParamId("guestId"),
    validateUpdateGuest,
    handlePatchGuest
  )
  .put(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    verifyParamId("guestId"),
    handlePutGuest
  );

export default router;
