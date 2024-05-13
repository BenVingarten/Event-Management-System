import { Router } from "express";
import { verifyEventId } from "../middleware/VerifyEventId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetTasks, handleUpdateTaskList } from "../Controllers/tasksController.js"
import { validatePutTask } from "../middleware/verifyTaskDetails.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/tasks")
  .get(verifyUserIdMatchAuthId, verifyEventId, handleGetTasks)
  .put(verifyUserIdMatchAuthId, verifyEventId, validatePutTask, handleUpdateTaskList);
    

export default router;
