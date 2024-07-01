import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";
import { Button } from "flowbite-react";
import moment from "moment-timezone";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Invitations = ({ userId, setInvitationsRefresh }) => {
  const axiosPrivate = useAxiosPrivate();
  const [isOpen, setIsOpen] = useState(false);
  const effectRun = useRef(false);

  const [invitations, setInvitations] = useState([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchInvitations = async () => {
      try {
        const response = await axiosPrivate.get(`/users/${userId}/invites`, {
          signal: controller.signal,
        });
        setInvitations(response.data.userInvites);
      } catch (error) {
        console.error("Error fetching invitations:", error);
        if (!error?.response) toast.error("Error: No response from server.");
        else toast.error("Error: " + error.response?.data.error);
      }
    };

    if (effectRun.current) fetchInvitations();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
  }, []);
  //console.log(invitations);

  const handleAccept = async (invitationId) => {
    const controller = new AbortController();
    try {
      console.log(invitationId);
      await axiosPrivate.patch(
        `/users/${userId}/invites/${invitationId}`,
        { answer: true },
        { signal: controller.signal }
      );
      setInvitations((prevInvitations) =>
        prevInvitations.filter((invitation) => invitation._id !== invitationId)
      );
      setInvitationsRefresh((prev) => prev + 1);
      toast.success("Invitation accepted");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.err);
    }
  };

  const handleDecline = async (invitationId) => {
    const controller = new AbortController();
    try {
      await axiosPrivate.patch(
        `/users/${userId}/invites/${invitationId}`,
        { answer: false },
        { signal: controller.signal }
      );
      setInvitations((prevInvitations) =>
        prevInvitations.filter((invitation) => invitation._id !== invitationId)
      );
      toast.success("Invitation declined");
    } catch (error) {
      console.error("Error declining invitation:", error);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.err);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-64 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-64" : "h-12"
      }`}
    >
      <Toaster />
      <div
        className="bg-blue-600 text-white p-3 cursor-pointer text-center"
        onClick={toggleChat}
      >
        <span>Invitations</span>
      </div>
      {isOpen && (
        <div className="p-3 overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="text-center">No invitations</div>
          ) : (
            <ul className="space-y-2">
              {invitations.map((invitation) => (
                <li
                  key={invitation._id}
                  className="flex justify-between p-2 bg-gray-100 rounded-lg"
                >
                  <div>
                    <h1 className="font-bold font-serif underline">
                      {invitation.event.name}
                    </h1>
                    <p>{invitation.event.type}</p>
                    <p>
                      {moment(new Date(invitation.event.date) * 1000)
                        .tz("Israel")
                        .format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div>
                    <Button
                      size={"sm"}
                      color={"green"}
                      className="mb-2"
                      onClick={() => handleAccept(invitation._id)}
                    >
                      <FaCheck color="green" />
                    </Button>
                    <Button
                      size={"sm"}
                      color={"red"}
                      onClick={() => handleDecline(invitation._id)}
                    >
                      <IoMdClose color="red" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

Invitations.propTypes = {
  userId: PropTypes.string.isRequired,
  setInvitationsRefresh: PropTypes.func.isRequired,
};

export default Invitations;
