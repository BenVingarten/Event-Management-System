import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetVendors, handleAddCustomVendor } from "../Controllers/vendorsController.js";
import { validateCreateVendor } from "../middleware/verifyVendorDetails.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/vendors")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetVendors)
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), validateCreateVendor, handleAddCustomVendor);

router
  .route("/users/:id/events/:eventId/vendors/:vendorId")
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId") )
  .patch(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId") );
export default router;
