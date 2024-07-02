import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";

const ChatWidget = ({ suggestions, setCards, userId, eventId }) => {
  const axiosPrivate = useAxiosPrivate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const containerRef = useRef(null);

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
      const response = await axiosPrivate.post(
        `/users/${userId}/events/${eventId}/tasks`,
        { newCard, suggested: true },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Task added successfully");
      setCards((prev) => [...prev, response.data.newTask]);
      suggestions.forEach((category) => {
        category.tasks = category.tasks.filter((t) => t !== task);
      });
    } catch (error) {
      console.error("Error adding task:", error);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.error);
    }
  };

  const handleCategoryClick = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      if (expandedCategory) {
        containerRef.current.style.height = `${containerRef.current.scrollHeight}px`;
      } else {
        containerRef.current.style.height = isOpen ? "256px" : "48px"; // Adjust this to the closed height
      }
    }
  }, [expandedCategory, isOpen]);

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-4 right-4 w-64 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-auto" : "h-12"
      }`}
      style={{ transition: "height 0.3s ease" }}
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
            {suggestions.map((category, index) => (
              <li key={index}>
                <div
                  className="bg-gray-100 rounded-lg p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleCategoryClick(category.category)}
                >
                  {category.category}
                </div>
                {expandedCategory === category.category && (
                  <ul className="mt-2 space-y-1">
                    {category.tasks.map((task, taskIndex) => (
                      <li
                        key={taskIndex}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleAddTask(task)}
                      >
                        {task}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

ChatWidget.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      tasks: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  setCards: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

export default ChatWidget;
