import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import InvitesModel from "../models/Invitations.js";
import userModel from "../models/User.js";

export const getInvites = async (userEmail) => {
  try {
    const invites = await InvitesModel.find({ email: userEmail });
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
    await InvitesModel.findOneAndDelete({
      email: collaboratorEmail,
      event: eventId,
    }).exec();
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
    if (answer) {
      // if the user accepted the invite add the event to his event list
      const user = await userModel
        .updateOne({ email: invite.email }, { $push: { events: invite.event } })
        .exec();
      if (user.matchedCount === 0)
        throw new DataNotFoundError(
          "couldnt find user with email like in the invite"
        );
      // update the event, add the userId to the collaborators
      const event = await eventModel
        .updateOne(
          { _id: invite.event, "collaborators.email": invite.email },
          { $set: { "collaborators.$.collaboratorId": userId } }
        )
        .exec();
      if (event.matchedCount === 0)
        throw new DataNotFoundError(
          "couldnt find event with this eventId and collaborator email like in the invite"
        );
    } else {
      const event = await eventModel
        .updateOne(
          { _id: invite.event },
          { $pull: { collaborators: invite.email } }
        )
        .exec();
      if (event.matchedCount === 0)
        throw new DataNotFoundError(
          "couldnt find event with this eventId and collaborator email like in the invite"
        );
    }
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in handling user's invite response: ${err.message}`
    );
  }
};
