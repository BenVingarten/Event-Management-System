import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import { handleGetTasks, handleUpdateTaskList } from "../Controllers/tasksController.js"
import { validatePutTask } from "../middleware/verifyTaskDetails.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/tasks")
  .get(verifyUserIdMatchAuthId, verifyParamId ('eventId'), handleGetTasks)
  .put(verifyUserIdMatchAuthId, verifyParamId ('eventId'), validatePutTask, handleUpdateTaskList);
    

export default router;
