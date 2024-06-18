import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";

const ChatWidget = ({ userId }) => {
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
        console.log(invitations);
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
              {invitations.map((invitation, index) => (
                <li
                  key={index}
                  className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  {invitation}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

ChatWidget.propTypes = {
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

export default ChatWidget;
