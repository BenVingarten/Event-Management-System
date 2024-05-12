import { Router } from "express";
import { verifyEventId } from "../middleware/VerifyEventId";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId";
import { validateQueryTasks } from "../middleware/verifyTaskDetails.js";
import { handleCreateTask, handleGetTasks } from "../Controllers/tasksController.js"
import { validateCreateTask } from "../middleware/verifyTaskDetails.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/tasks")
  .get(verifyUserIdMatchAuthId, verifyEventId, validateQueryTasks,  handleGetTasks)
  .post(verifyUserIdMatchAuthId, verifyEventId, validateCreateTask, handleCreateTask);
    
router.route("/users/:id/events/:eventId/tasks/:priority")
.get()
.patch()
.delete();

export default router;
