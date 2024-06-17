import { Router } from "express";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { verifyParamId } from "../middleware/verifyParamId.js"
import { handleGetUserInvites, handleInviteResponse } from "../Controllers/invitesController.js";
const router = Router();

router
  .route("/users/:id/invites")
  .get(verifyUserIdMatchAuthId, handleGetUserInvites);

  router.route("/users/:id/invites/:inviteId")
  .patch(verifyUserIdMatchAuthId, verifyParamId("inviteId"), handleInviteResponse)