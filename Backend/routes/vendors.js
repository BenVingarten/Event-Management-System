import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { 
  handleGetVendors,
  handleAddRegisteredVendor,
  handleAddCustomVendor,
  handleUpdateRegisteredVendor,
  handleUpdateCustomVendor,
  handleDeleteVendor,
  handleDeleteVendorEvent,
  handleGetUpcomingEvents
 } from "../Controllers/vendorsController.js";
import { validateCreateCustomVendor, validateUpdateRegisteredVendor, validateUpdateCustomVendor } from "../middleware/verifyVendorDetails.js";


const router = Router();

router // All Vendors
  .route("/users/:id/events/:eventId/vendors")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetVendors)
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), validateCreateCustomVendor, handleAddCustomVendor)
  .delete(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleDeleteVendor);

router // For registeredVendors
  .route("/users/:id/events/:eventId/vendors/:vendorId")
  .post(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId"), handleAddRegisteredVendor)
  .patch(verifyUserIdMatchAuthId, verifyParamId("eventId"), verifyParamId("vendorId"), validateUpdateRegisteredVendor, handleUpdateRegisteredVendor)

router // For customVendors
  .route("/users/:id/events/:eventId/vendors/:vendorEmail")
  .patch(verifyUserIdMatchAuthId, verifyParamId("eventId"), validateUpdateCustomVendor, handleUpdateCustomVendor);

router // For users who are vendors
.route("/users/:id/upcomingEvents/:eventId")
.delete(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleDeleteVendorEvent);

router 
.route("/users/:id/upcomingEvents")
.get(verifyUserIdMatchAuthId, handleGetUpcomingEvents);
  
export default router;
