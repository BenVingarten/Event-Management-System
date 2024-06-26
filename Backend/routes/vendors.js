import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetVendors } from "../Controllers/vendorsController.js";
const router = Router();

router
  .route("/users/:userId/events/:eventId/vendors")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetVendors);

export default router;
