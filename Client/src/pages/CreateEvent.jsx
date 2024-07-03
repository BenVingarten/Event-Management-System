import { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button, ListGroup, Radio } from "flowbite-react";
import { locations, eventTypes } from "../constants";

const CreateEventPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [additionalInfoInput, setAdditionalInfoInput] = useState("");

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleEventTypeChange = (e) => {
    setEventType(e.target.value);
  };

  const handleEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const handleEventNameChange = (e) => {
    setEventName(e.target.value);
  };

  const handleAdditionalInfoChange = (e) => {
    setAdditionalInfoInput(e.target.value);
  };

  const handleAddInfo = () => {
    if (additionalInfoInput.trim() !== "") {
      setAdditionalInfo([...additionalInfo, additionalInfoInput]);
      setAdditionalInfoInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const controller = new AbortController();

    const date = new Date(eventDate);
    const epochTime = Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds

    const eventData = {
      name: eventName,
      date: epochTime,
      type: eventType,
      budget,
      location,
      additionalInfo,
    };
    console.log("Event Data:", eventData);
    try {
      const userId = jwtDecode(auth.accessToken).userInfo.id;
      //console.log("User ID:", userId);
      const response = await axiosPrivate.post(
        `/users/${userId}/events`,
        eventData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Event created successfully");
      console.log("Event created successfully:", response.data);
      navigate("/myEvents", { replace: true });
    } catch (error) {
      console.error("Error creating event:", error.response?.data.err);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.err);
    }
  };

  const handleLocationChange = (value) => {
    setLocation(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        {/* Event Name */}
        <div className="mb-4">
          <div className="mb-4">
            <label
              htmlFor="eventName"
              className="block text-gray-700 font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={handleEventNameChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>
        {/* Event Date */}
        <div className="mb-4">
          <label
            htmlFor="eventDate"
            className="block text-gray-700 font-bold mb-2"
          >
            Date
          </label>
          <input
            type="date"
            id="eventDate"
            value={eventDate}
            onChange={handleEventDateChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        {/* Event Type */}
        <div className="mb-4">
          <label
            htmlFor="eventType"
            className="block text-gray-700 font-bold mb-2"
          >
            Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={handleEventTypeChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          >
            {eventTypes.map((curType) => (
              <option key={curType.value} value={curType.value}>
                {curType.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="mb-4">
          <label
            htmlFor="budget"
            className="block text-gray-700 font-bold mb-2"
          >
            Budget
          </label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={handleBudgetChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-gray-700 font-bold mb-2"
          >
            Location
          </label>
          <ListGroup>
            {locations.map((curLocation) => (
              <ListGroup.Item
                key={curLocation.value}
                className="flex items-center"
              >
                <Radio
                  id={curLocation.value}
                  name="location"
                  value={curLocation.value}
                  checked={location === curLocation.value}
                  onChange={() => handleLocationChange(curLocation.value)}
                  className="mr-2"
                />
                <label htmlFor={curLocation.value}>{curLocation.label}</label>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Additional Information */}
        <div className="mb-4">
          <label
            htmlFor="additionalInfo"
            className="block text-gray-700 font-bold mb-2"
          >
            Additional Information
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="additionalInfo"
              value={additionalInfoInput}
              onChange={handleAdditionalInfoChange}
              className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter additional information"
            />
            <button
              type="button"
              onClick={handleAddInfo}
              className="bg-blue-500 text-white font-bold px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Additional Information List */}
        <div>
          {additionalInfo.map((info, index) => (
            <div key={index} className="mb-2 flex">
              <input
                type="text"
                value={info}
                readOnly
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              />
              <Button
                color={"red"}
                onClick={() =>
                  setAdditionalInfo(
                    additionalInfo.filter((_, i) => i !== index)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;
