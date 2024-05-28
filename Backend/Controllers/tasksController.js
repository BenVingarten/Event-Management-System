import { matchedData, validationResult } from "express-validator";
import { getTasks, updateTasks } from "../services/tasksLogic.js";
export const handleGetTasks = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const tasks = await getTasks(userId, eventId);
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleUpdateTaskList = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const taskListObj = matchedData(req);
    if (Object.keys(taskListObj).length === 0)
      throw new InvalidFieldModifyError();
    const { userId } = req;
    const { eventId } = req.params;
    const updatedTasks = await updateTasks(
      userId,
      eventId,
      taskListObj.cards
    );
    console.log(updatedTasks);
    return res.status(200).json({ success: "updated taskList successfully!" });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
