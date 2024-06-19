import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import InvitesModel from "../models/Invitations.js";
import userModel from "../models/User.js";

export const getInvites = async (userId) => {
  try {
    const user = await userModel.findById(userId).select("email");
    if (!user)
      throw new DataNotFoundError(
        "couldnt find a user with email matching the invite email"
      );
    const invites = await InvitesModel.find({ email: user.email }).populate({
      path: "event",
      select: "name date type -_id",
    });
    if (!invites)
      throw new DataNotFoundError(
        "the invites for user with that email cant be found"
      );
    return invites;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting user invites: ${err.message}`
    );
  }
};

export const addInvite = async (collaboratorEmail, event) => {
  try {
    const newInvite = await InvitesModel.create({
      email: collaboratorEmail,
      event: event._id,
    });
    if (!newInvite)
      throw new GeneralServerError("unexpected error in creating new invite");
  } catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError(
      `unexpected error in adding user's invite: ${err.message}`
    );
  }
};

export const deleteInvite = async (collaboratorEmail, eventId) => {
  try {
    const result = await InvitesModel.findOneAndDelete({
      email: collaboratorEmail,
      event: eventId,
    }).exec();
    if (!result)
      throw new DataNotFoundError("couldnt find the invite to delete");
  } catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting user's invite: ${err.message}`
    );
  }
};

export const updateByInviteResponse = async (userId, inviteId, answer) => {
  try {
    // first find the invitation
    const invite = await InvitesModel.findByIdAndDelete(inviteId).select(
      "event email"
    );
    if (!invite) throw DataNotFoundError("couldnt find invite with this id");
    if (answer === true) {
      // if the user accepted the invite add the event to his event list
      const user = await userModel
        .updateOne(
          { email: invite.email, _id: userId },
          { $push: { events: invite.event } }
        )
        .exec();
      if (user.matchedCount === 0)
        throw new DataNotFoundError(
          "couldnt find user with email like in the invite"
        );
      // update the event, add the userId to the collaborators if not there
      const event = await eventModel
        .updateOne(
          {
            _id: invite.event,
            "collaborators.email": invite.email,
          },
          {
            $set: {
              "collaborators.$.collaboratorId": userId,
              "collaborators.$.status": "Active",
            },
          }
        )
        .exec();
    } else {
      const event = await eventModel
        .updateOne(
          { _id: invite.event },
          { $pull: { collaborators: { email:invite.email } } }
        )
        .exec();
      if (event.matchedCount === 0)
        throw new DataNotFoundError(
          "couldnt find event with this eventId and collaborator email like in the invite"
        );
      return answer;
    }
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in handling user's invite response: ${err.message}`
    );
  }
};
