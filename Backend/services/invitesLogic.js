import { DataNotFoundError } from "../errors/DataNotFoundError";
import { GeneralServerError } from "../errors/GeneralServerError";
import InvitesModel from "../models/Invitations"

export const getInvites = async (userEmail) => {
    try {
        const invites = await InvitesModel.find({ email: userEmail });
        if(!invites) throw new DataNotFoundError("the invites for user with that email cant be found");
        return invites;
    } catch(err) {
        if(err instanceof DataNotFoundError) throw err;
        throw new GeneralServerError("unexpected error in getting user invites");
    }
};
0
export const addInvite = async (collaboratorEmail, event) => {
    try {
        const newInvite = await InvitesModel.create({
            email: collaboratorEmail,
            event: event._id,
          });
        if(!newInvite) throw new GeneralServerError("unexpected error in creating new invite");
    } catch (err) {
        if(err instanceof GeneralServerError) throw err;
        throw new GeneralServerError();
    }
};

export const deleteInvite = async (collaboratorEmail, event) => {
    try{
        await InvitesModel.findOneAndDelete({
        email: collaboratorEmail,
        event: event._Id,
      }).exec();
    } catch (err) {
        if(err instanceof GeneralServerError) throw err;
        throw new GeneralServerError();
    }
};