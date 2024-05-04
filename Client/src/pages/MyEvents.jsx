import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { Card } from "flowbite-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const effectRun = useRef(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="container ml-5 w-full">
      <Toaster />
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
