import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { Card } from "flowbite-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    // Fetch user's events from the backend
    const fetchEvents = async () => {
      try {
        const response = await axiosPrivate.get("/userEvents");
        if (response.status === 200) {
          setEvents(response.data.events);
        } else {
          console.error("Failed to fetch events:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container ml-5 w-full">
      <h2 className="mt-8 mb-4 text-2xl font-bold">My Events</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <h3 className="text-lg font-bold">{event.name}</h3>
              <p>Date: {event.date}</p>
              <p>Type: {event.type}</p>
              <p>Number of Guests: {event.guests}</p>
              <p>Number of Tasks: {event.tasks}</p>
              <Link to={`/event/${event.id}`} className="mt-auto">
                <IoMdCalendar className="text-3xl text-blue-500 hover:text-blue-700 cursor-pointer" />
              </Link>
            </Card>
          ))
        ) : (
          <div className="text-lg font-semibold ">
            You have no events yet. Go ahead and create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
