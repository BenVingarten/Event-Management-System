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

  const [cards, setCards] = useState(DEFAULT_CARDS);

  useEffect(() => {
    //TODO: Fetch tasks from the server and update state

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

        console.log(response.data.events);
        setCards(response.data.events);
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
        column="backlog"
        headingColor="text-red-500"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-400"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-500"
        cards={cards}
        setCards={setCards}
      />
      <div>
        <BurnBarrel setCards={setCards} />
        <SaveTasks setCards={setCards} />
      </div>
    </div>
  );
};

const Column = ({ title, headingColor, cards, column, setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
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

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
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
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

const Card = ({ title, id, column, handleDragStart }) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-50 bg-neutral-100 p-3 active:cursor-grabbing"
      >
        <p className="text-sm text-neutral-800">{title}</p>
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

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  //TODO: Implement the functionality to delete a task
  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setCards((pv) => pv.filter((c) => c.id !== cardId));

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

const SaveTasks = ({ setCards }) => {
  //TODO: Implement the functionality to send tasks to the server

  const handleSave = () => {
    // Send request to the server to update tasks
    /* updateTasks(newCards)
    .then((response) => console.log("Tasks updated successfully"))
    .catch((error) => console.error("Error updating tasks:", error)); */
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

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };

    setCards((pv) => [...pv, newCard]);

    setText("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
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

const DEFAULT_CARDS = [
  // BACKLOG
  { title: "Create guest list for conference", id: "11", column: "backlog" },
  {
    title: "Design event program for charity fundraiser",
    id: "12",
    column: "backlog",
  },
  {
    title: "Finalize agenda for marketing seminar",
    id: "13",
    column: "backlog",
  },

  // TODO
  { title: "Book venue for annual company party", id: "14", column: "todo" },
  {
    title: "Coordinate logistics for product launch event",
    id: "15",
    column: "todo",
  },

  // DOING
  {
    title: "Arrange catering for team building event",
    id: "16",
    column: "doing",
  },

  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "17",
    column: "done",
  },
];

// Prop types
Column.propTypes = {
  title: PropTypes.string.isRequired,
  headingColor: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  column: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  handleDragStart: PropTypes.func.isRequired,
};

DropIndicator.propTypes = {
  beforeId: PropTypes.string,
  column: PropTypes.string.isRequired,
};

BurnBarrel.propTypes = {
  setCards: PropTypes.func.isRequired,
};

AddCard.propTypes = {
  column: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
};

SaveTasks.propTypes = {
  setCards: PropTypes.func.isRequired,
};
