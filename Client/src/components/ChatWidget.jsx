import PropTypes from "prop-types";
import { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";

const ChatWidget = ({ suggestions, setCards, userId, eventId }) => {
  const axiosPrivate = useAxiosPrivate();
  const [isOpen, setIsOpen] = useState(false);

  //TODO: change the suggestions to be fetched from the server
  // (from an AI model or a database)

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleAddTask = async (task) => {
    const newCard = {
      title: task,
      column: "TODO",
    };

    const controller = new AbortController();
    try {
      //console.log("User ID:", userId);
      //console.log(cards);

      const response = await axiosPrivate.post(
        `/users/${userId}/events/${eventId}/tasks`,
        newCard,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Task added successfully");
      setCards((pv) => [...pv, response.data.newTask]);
      //console.log);
      //console.log("tasks saved successfully:", response.data);
    } catch (error) {
      console.error("Error adding task:", error);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.error);
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
        <span>Suggestions</span>
      </div>
      {isOpen && (
        <div className="p-3 overflow-y-auto">
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                onClick={() => handleAddTask(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

ChatWidget.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCards: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

export default ChatWidget;
