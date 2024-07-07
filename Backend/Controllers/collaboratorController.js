import { validationResult, matchedData } from "express-validator";
import {
  addCollaborator,
  deleteCollaborator,
} from "../services/collaboratorsLogic.js";

export const handleAddCollaborator = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const collaboratorData = matchedData(req);
    const { userId } = req;
    const { eventId } = req.params;
    const newCollaborator = await addCollaborator(
      userId,
      eventId,
      collaboratorData
    );
    return res.status(201).json({
      newCollaborator,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleDeleteCollaborator = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const collaborator = req.body;
    const deletedCollab = await deleteCollaborator(
      userId,
      eventId,
      collaborator
    );
    return res.status(200).json({
      deleted: `you successfully deleted the collaborator: ${collaborator.email}`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
