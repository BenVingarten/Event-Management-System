import { matchedData, validationResult } from "express-validator";

export const handleCreateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });
    const verifiedData = matchedData(req);
    const { userId } = req;
    const { eventId } = req.params;
    const task = await createTask(userId, eventId, verifiedData);
    return res
      .status(201)
      .json({ success: `successfully added new task to ${task.status}` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleGetTasks = async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.status(400).json({ error: errors.array() });
}

            
       
    