import {
  getInvites,
  updateByInviteResponse,
} from "../services/invitesLogic.js";

export const handleGetUserInvites = async (req, res) => {
  try {
    const { userEmail } = req;
    const userInvites = await getInvites(userEmail);
    return res.status(200).json({ userInvites });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleInviteResponse = async (req, res) => {
  try {
    if (!req?.body?.answer)
      return res
        .status(400)
        .json({ failed: "The invitation response is missing" });
    const { answer } = req.body;
    const { userId } = req;
    const { inviteId } = req.params;
    const inviteResponse = await updateByInviteResponse(
      userId,
      inviteId,
      answer
    );
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
