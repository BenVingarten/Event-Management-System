import { Router } from "express"
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetUserInvites } from "../Controllers/"
const router = Router();

router.route("/users/:id/invites")
.get(verifyUserIdMatchAuthId, handleGetUserInvites);