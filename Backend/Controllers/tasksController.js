import { matchedData, validationResult } from "express-validator";
import {
  createTask,
  getTasks,
  updateTasks,
  deleteTask,
  getSuggestedTasks,
} from "../services/tasksLogic.js";
export const handleGetTasks = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const tasks = await getTasks(userId, eventId);
    const suggestedTasks = await getSuggestedTasks(userId, eventId);
    console.log(suggestedTasks);
    const allTasks = { tasks, suggestedTasks };
    return res.status(200).json(allTasks);
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleCreateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const verifiedTask = matchedData(req);
    const { suggested, newCard } = req.body
    const { userId } = req;
    const { eventId } = req.params;
    const newTask = await createTask(userId, eventId, newCard, suggested);
    return res.status(200).json({ newTask });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleUpdateTaskList = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const { cards } = req.body;
    const { userId } = req;
    const { eventId } = req.params;
    await updateTasks(userId, eventId, cards);
    return res.status(200).json({ success: "updated taskList successfully!" });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleDeleteTask = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId, taskId } = req.params;
    await deleteTask(userId, eventId, taskId);
    return res.status(200).json({ success: "successfully deleted the task!" });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
