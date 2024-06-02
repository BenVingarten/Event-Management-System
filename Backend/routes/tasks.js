import { Router } from "express";
import { verifyParamId } from "../middleware/verifyParamId.js";
import { verifyUserIdMatchAuthId } from "../middleware/verifyUserIdMatchAuthId.js";
import {
  handleGetTasks,
  handleUpdateTaskList,
  handleDeleteTask,
  handleCreateTask,
} from "../Controllers/tasksController.js";
import {
  validatePutTask,
  validateCreateTask,
} from "../middleware/verifyTaskDetails.js";
const router = Router();

router
  .route("/users/:id/events/:eventId/tasks")
  .get(verifyUserIdMatchAuthId, verifyParamId("eventId"), handleGetTasks)
  .post(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    validateCreateTask,
    handleCreateTask
  )
  .put(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    validatePutTask,
    handleUpdateTaskList
  );

router
  .route("/users/:id/events/:eventId/tasks/:taskId")
  .delete(
    verifyUserIdMatchAuthId,
    verifyParamId("eventId"),
    verifyParamId("taskId"),
    handleDeleteTask
  );

export default router;
