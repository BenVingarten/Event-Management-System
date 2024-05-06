import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { Button, Card, Modal } from "flowbite-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import { FaQuestionCircle, FaMoneyBillWave } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import moment from "moment-timezone";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const effectRun = useRef(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    // Fetch user's events from the backend
    const fetchEvents = async () => {
      try {
        const userId = jwtDecode(auth.accessToken).userInfo.id;
        const response = await axiosPrivate.get(`/users/${userId}/events`, {
          signal: controller.signal,
        });

        console.log(response.data.events);
        setEvents(response.data.events);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch users");
        navigate("/unauthorized", { state: { from: location }, replace: true });
      }
    };

    if (effectRun.current) fetchEvents();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
  }, []);

  const handleDeleteConfirmation = (eventId) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    //TODO: Perform delete action here
    console.log("Deleting event");
    setIsModalOpen(false); // Close the modal after deletion
  };

  return (
    <div className="container ml-5 w-full">
      <Toaster />
      <h2 className="mt-8 mb-4 text-2xl font-bold ">My Events</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => {
            // Parse the date string into a Date object
            const eventDate = new Date(event.date);
            // Format the date as dd-mm-yyyy
            const formattedDate = moment(eventDate * 1000)
              .tz("Israel")
              .format("DD-MM-YYYY");

            return (
              <Card key={event._id} className="flex flex-col">
                <h3
                  className="text-2xl text-white rounded-md text-center font-mono font-bold bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% cursor-pointer underline hover:text-blue-500"
                  onClick={() => navigate(`/eventDetails/${event._id}`)}
                >
                  {event.name}
                </h3>
                <div className="grid grid-cols-2">
                  <span className="flex mb-5 ">
                    <IoMdCalendar className="mr-2 text-3xl text-blue-500" />
                    <p className="font-sans font-semibold">{formattedDate}</p>
                  </span>

                  <span className="flex ">
                    <FaQuestionCircle className="mr-2 text-3xl text-blue-500" />
                    <p className="font-sans font-semibold">{event.type}</p>
                  </span>

                  <span className="flex ">
                    <FaMoneyBillWave className="mr-2 text-3xl text-blue-500" />
                    <p className="font-sans font-semibold">{event.budget}</p>
                  </span>

                  <span className="flex ">
                    <FaLocationDot className="mr-2 text-3xl text-blue-500" />
                    <p className="font-sans font-semibold">{event.location}</p>
                  </span>
                </div>
                <Button
                  outline
                  color={"red"}
                  size="lg"
                  onClick={() => handleDeleteConfirmation(event._id)}
                >
                  <MdDeleteForever
                    size={25}
                    className="mr-2 text-3xl text-red-500"
                  />
                  Delete Event
                </Button>
              </Card>
            );
          })
        ) : (
          <div>
            <p className="text-lg font-semibold">
              You have no events yet. Go ahead and create one!
            </p>
            <Button
              outline
              gradientDuoTone="pinkToOrange"
              size="lg"
              onClick={() => navigate("/createEvent")}
            >
              Go ahead and create one!
            </Button>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-5">
          <h3 className="text-lg font-bold mb-3">
            Are you sure you want to delete this event?
          </h3>
          <div className="flex justify-end">
            <Button
              color={"red"}
              size="sm"
              className="mr-3"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyEvents;
