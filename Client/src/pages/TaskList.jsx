import { useEffect, useRef, useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import PropTypes from "prop-types";
import { Button } from "flowbite-react";
import { jwtDecode } from "jwt-decode";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { Toaster, toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";

import { taskStatus } from "../constants.js";

export default function TaskList() {
  return (
    <div className="h-screen w-full text-neutral-800">
      <Board />
    </div>
  );
}

const Board = () => {
  const axiosPrivate = useAxiosPrivate();
  const effectRun = useRef(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const eventID = location.state.eventId;
  const userId = jwtDecode(auth.accessToken).userInfo.id;
  const [cards, setCards] = useState([]);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  //console.log(cards);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTasks = async () => {
      try {
        const userId = jwtDecode(auth.accessToken).userInfo.id;
        const response = await axiosPrivate.get(
          `/users/${userId}/events/${eventID}/tasks`,
          {
            signal: controller.signal,
          }
        );

        setCards(response.data.tasks);
        setSuggestedTasks(response.data.suggestedTasks);
      } catch (err) {
        console.log("Error: " + err.response?.data.err);
        toast.error("No Events Found!");
        navigate("/unauthorized", { state: { from: location }, replace: true });
      }
    };

    if (effectRun.current) fetchTasks();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
  }, []);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      <Toaster />
      <Column
        title="Backlog"
        column={taskStatus[0]}
        headingColor="text-red-500"
        cards={cards}
        setCards={setCards}
        userId={userId}
        eventId={eventID}
      />
      <Column
        title="TODO"
        column={taskStatus[1]}
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
        userId={userId}
        eventId={eventID}
      />
      <Column
        title="In progress"
        column={taskStatus[2]}
        headingColor="text-blue-400"
        cards={cards}
        setCards={setCards}
        userId={userId}
        eventId={eventID}
      />
      <Column
        title="Complete"
        column={taskStatus[3]}
        headingColor="text-emerald-500"
        cards={cards}
        setCards={setCards}
        userId={userId}
        eventId={eventID}
      />
      <div>
        <BurnBarrel setCards={setCards} userId={userId} eventId={eventID} />
        <SaveTasks userId={userId} eventId={eventID} cards={cards} />
      </div>
      <ChatWidget
        suggestions={suggestedTasks}
        userId={userId}
        eventId={eventID}
        setCards={setCards}
      />
    </div>
  );
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  userId,
  eventId,
}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c._id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c._id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el._id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center ">
        <span className="rounded text-sm text-neutral-600 mr-3">
          {filteredCards.length}
        </span>
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-100/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return (
            <Card
              key={c._id}
              {...c}
              setCards={setCards}
              handleDragStart={handleDragStart}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard
          column={column}
          setCards={setCards}
          userId={userId}
          eventId={eventId}
        />
      </div>
    </div>
  );
};

const Card = ({ title, _id, column, handleDragStart, setCards }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleFinishEdit = () => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === _id ? { ...card, title: newTitle } : card
      )
    );
    setIsEditing(false);
  };

  return (
    <>
      <DropIndicator beforeId={_id} column={column} />
      <motion.div
        layout
        layoutId={_id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, _id)}
        className="cursor-grab rounded border border-neutral-50 bg-neutral-100 p-3 active:cursor-grabbing"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <div>
            <input
              value={newTitle}
              onChange={handleTitleChange}
              autoFocus
              className="w-full border rounded p-1"
            />
            <button
              onClick={handleFinishEdit}
              className="text-xs text-blue-500"
            >
              Finish edit
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-800">{title}</p>
        )}
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = ({ setCards, userId, eventId }) => {
  const [active, setActive] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    const handleDeleteCard = async (e) => {
      e.preventDefault();

      const controller = new AbortController();
      try {
        //console.log("User ID:", userId);
        //console.log(cards);

        const response = await axiosPrivate.delete(
          `/users/${userId}/events/${eventId}/tasks/${cardId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
            signal: controller.signal,
          }
        );
        toast.success("Task deleted successfully");

        setCards((pv) => pv.filter((c) => c._id !== cardId));
        //console.log);
        //console.log("tasks saved successfully:", response.data);
      } catch (error) {
        console.error("Error deleting task:", error.response?.data);
        if (!error?.response) toast.error("Error: No response from server.");
        else toast.error("Error: " + error.response?.data.error);
      }
    };

    handleDeleteCard(e);
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const SaveTasks = ({ userId, eventId, cards }) => {
  const axiosPrivate = useAxiosPrivate();
  //console.log(userId);
  const handleSave = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    try {
      //console.log("User ID:", userId);
      console.log(cards);
      const response = await axiosPrivate.put(
        `/users/${userId}/events/${eventId}/tasks`,
        { cards },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("tasks saved successfully");
      //console.log("tasks saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving tasks:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.error[0].msg);
    }
  };

  return (
    <div>
      <Button
        className="mt-5 grid h-20 w-56 place-content-center "
        size="xl"
        gradientDuoTone="greenToBlue"
        onClick={handleSave}
      >
        Save
      </Button>
    </div>
  );
};

const AddCard = ({ column, setCards, userId, eventId }) => {
  /*
  console.log("User ID:", userId);
  console.log("Event ID:", eventId);
  console.log("Column:", column);
  console.log("Cards:", setCards);
  */
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleAddCard = async (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    const newCard = {
      title: text.trim(),
      column,
      //id: Math.random().toString(),
    };
    console.log("user id:", userId);
    const controller = new AbortController();
    try {
      //console.log("User ID:", userId);
      //console.log(cards);

      const response = await axiosPrivate.post(
        `/users/${userId}/events/${eventId}/tasks`,
        { newCard, suggested: false },
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
      console.error("Error adding task:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.error);
    }

    setText("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleAddCard}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-500 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

// Prop types
Column.propTypes = {
  title: PropTypes.string.isRequired,
  headingColor: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  column: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  handleDragStart: PropTypes.func.isRequired,
  setCards: PropTypes.func.isRequired,
};

DropIndicator.propTypes = {
  beforeId: PropTypes.string,
  column: PropTypes.string.isRequired,
};

BurnBarrel.propTypes = {
  setCards: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

AddCard.propTypes = {
  column: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
};

SaveTasks.propTypes = {
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
};
