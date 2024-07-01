import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetVendors, handleAddRegisteredVendor, handleAddCustomVendor, handleUpdateRegisteredVendor } from "../Controllers/vendorsController.js";
import { validateCreateCustomVendor, validateUpdateRegisteredVendor } from "../middleware/verifyVendorDetails.js";


const router = Router();

router
  .route("/users/:id/events/:eventId/vendors")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetVendors)
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), validateCreateCustomVendor, handleAddCustomVendor);

router
  .route("/users/:id/events/:eventId/vendors/:vendorId")
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId"), handleAddRegisteredVendor)
  .patch(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId"), validateUpdateRegisteredVendor, handleUpdateRegisteredVendor);
export default router;
