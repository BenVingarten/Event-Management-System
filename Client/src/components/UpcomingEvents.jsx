import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";
import { Badge, Button, Card, ListGroup } from "flowbite-react";
import moment from "moment-timezone";

function UpcomingEvents({ userId }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const effectRun = useRef(false);

  // fetch upcoming events for the user
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axiosPrivate.get(
          `/users/${userId}/upcomingEvents`
        );
        console.log(response);
        setUpcomingEvents(response.data);
        toast.success("Upcoming events fetched successfully");
      } catch (err) {
        console.log(err);
        toast.error("No Upcoming Events Found!");
      }
    };

    if (effectRun.current) fetchUpcomingEvents();

    return () => {
      effectRun.current = true;
    };
  }, [userId]);

  const handleRemoveEvent = async (eventId) => {
    try {
      toast.loading("Removing event...", { duration: 2000 });

      const response = await axiosPrivate.delete(
        `/users/${userId}/upcomingEvents/${eventId}`
      );
      console.log(response);
      toast.success("Event removed successfully");
    } catch (err) {
      console.log(err.response.data);
      toast.error("Failed to remove event. Try again.");
    }
  };

  return (
    <Card>
      <Toaster />
      <h1 className="font-bold text-2xl w-fit">Upcoming Events</h1>
      {upcomingEvents.length === 0 ? (
        <Badge color="indigo" size={"xl"}>
          No upcoming events found
        </Badge>
      ) : (
        <ul>
          {upcomingEvents.map((event) => (
            <li key={event._id} className="flex mb-2 items-center">
              <p className="font-bold">{event.name} </p>
              <p className="ml-2">
                |{" "}
                {moment(new Date(event.date) * 1000)
                  .tz("Israel")
                  .format("DD-MM-YYYY")}{" "}
                | {event.location} | {event.type} | {event.owner.email}
              </p>
              <Button
                className="ml-2"
                color={"red"}
                onClick={() => handleRemoveEvent(event._id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

UpcomingEvents.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UpcomingEvents;
