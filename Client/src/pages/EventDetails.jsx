import { Chart } from "react-google-charts";
import { Button, Card } from "flowbite-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import { IoMdCalendar } from "react-icons/io";
import { FaQuestionCircle, FaMoneyBillWave } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import moment from "moment-timezone";

export default function EventDetails() {
  const [eventInfo, setEventInfo] = useState([]);

  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const effectRun = useRef(false);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getInfo = async () => {
      try {
        const userId = jwtDecode(auth.accessToken).userInfo.id;
        const eventId = location.state.eventId;
        console.log("Event ID: " + eventId);
        const response = await axiosPrivate.get(
          `/users/${userId}/events/${eventId}`,
          {
            signal: controller.signal,
          }
        );
        console.log(response.data.event);
        isMounted && setEventInfo(response.data.event);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch event info. Please try again later.");
        navigate("/myEvents", { state: { from: location }, replace: true });
      }
    };
    if (effectRun.current) getInfo();

    return () => {
      isMounted = false;
      controller.abort();
      effectRun.current = true;
    };
  }, []);

  const data = [
    ["Task", "Hours per Day"],
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7], // CSS-style declaration
  ];

  const options = {
    pieHole: 0.4,
    is3D: false,
    backgroundColor: { fill: "transparent" },
  };

  const displayEventDetails = () => {
    // Parse the date string into a Date object
    const eventDate = new Date(eventInfo.date);
    // Format the date as dd-mm-yyyy
    const formattedDate = moment(eventDate * 1000)
      .tz("Israel")
      .format("DD-MM-YYYY");

    return (
      <div className="grid grid-cols-2">
        <span className="flex mb-5 ">
          <IoMdCalendar className="mr-2 text-3xl text-blue-500" />
          <p className="font-sans font-semibold">{formattedDate}</p>
        </span>

        <span className="flex ">
          <FaQuestionCircle className="mr-2 text-3xl text-blue-500" />
          <p className="font-sans font-semibold">{eventInfo.type}</p>
        </span>

        <span className="flex ">
          <FaMoneyBillWave className="mr-2 text-3xl text-blue-500" />
          <p className="font-sans font-semibold">{eventInfo.budget}</p>
        </span>

        <span className="flex ">
          <FaLocationDot className="mr-2 text-3xl text-blue-500" />
          <p className="font-sans font-semibold">{eventInfo.location}</p>
        </span>
      </div>
    );
  };

  return (
    <div className=" h-screen flex flex-col">
      <Toaster />
      <h1 className=" p-4 text-xl font-bold">{eventInfo.name}</h1>

      {/* First area */}
      <Card className=" p-4">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Details
        </h5>
        {displayEventDetails()}
      </Card>
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Second area */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tasks
          </h5>
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={data}
            options={options}
          />
          <Button>Go to Tasks</Button>
        </Card>

        {/* Third area */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tasks
          </h5>
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={data}
            options={options}
          />
          <Button>Go to Tasks</Button>
        </Card>
      </div>
    </div>
  );
}
