import { Chart } from "react-google-charts";
import {
  Button,
  Card,
  Dropdown,
  Label,
  ListGroup,
  Modal,
  TextInput,
} from "flowbite-react";
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
  const [taskAnalytics, setTaskAnalytics] = useState([]);
  const [guestAnalytics, setGuestAnalytics] = useState([]);

  const [collaborators, setCollaborators] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);

  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const state = useLocation();
  const eventID = state.state.eventId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({
    name: null,
    budget: null,
    location: null,
    date: null,
  });

  console.log(eventInfo);
  console.log(collaborators);
  console.log(additionalInfo);

  // Fetch event details
  const effectRun = useRef(false);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getInfo = async () => {
      try {
        const userId = jwtDecode(auth.accessToken).userInfo.id;
        const eventId = state.state.eventId;
        //console.log("Event ID: " + eventId);
        const response = await axiosPrivate.get(
          `/users/${userId}/events/${eventId}`,
          {
            signal: controller.signal,
          }
        );
        //console.log(response.data);
        isMounted && setEventInfo(response.data.eventDetails.event);
        setTaskAnalytics(
          convertArray(
            response.data.eventDetails.taskAnalytics,
            "Tasks",
            "Precentage"
          )
        );
        setGuestAnalytics(
          convertArray(
            response.data.eventDetails.guestAnalytics,
            "Guests",
            "Precentage"
          )
        );
        setCollaborators(response.data.eventDetails.event.collaborators);
        setAdditionalInfo(response.data.eventDetails.event.additionalInfo);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch event info. Please try again later.");
        navigate("/myEvents", { state: { from: state }, replace: true });
      }
    };
    if (effectRun.current) getInfo();

    return () => {
      isMounted = false;
      controller.abort();
      effectRun.current = true;
    };
  }, [isModalOpen]);

  // Sample data for the pie chart
  const data = [
    ["Task", "Hours per Day"],
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7], // CSS-style declaration
  ];

  // Convert array to format required by Google Charts
  const convertArray = (inputArray, headerName, type) => {
    const header = [headerName, type];
    const data = inputArray.map((item) => [
      item.column ? item.column : item.status,
      item.percentage,
    ]);
    return [header, ...data];
  };

  // Chart options
  const options = {
    pieHole: 0.4,
    is3D: false,
    height: 300,
    width: 400,
    backgroundColor: { fill: "transparent" },
  };

  // Display event details
  const displayEventDetails = () => {
    // Parse the date string into a Date object
    const eventDate = new Date(eventInfo.date);
    // Format the date as dd-mm-yyyy
    const formattedDate = moment(eventDate * 1000)
      .tz("Israel")
      .format("DD-MM-YYYY");

    return (
      <div>
        <div className="grid grid-cols-2 mb-5">
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

          {/* Additional Info */}
          {additionalInfo.length > 0 && additionalInfoPresent()}

          {collaborators.length > 0 && collaboratorsPresent()}
        </div>
      </div>
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Save changes to event details
  const handleSaveChanges = async () => {
    // check which fields are updated
    const updatedFields = {};
    for (let [field, value] of Object.entries(updatedDetails)) {
      if (value != null && field == "date") {
        // change date to epoch time
        const date = new Date(value);
        value = Math.floor(date.getTime() / 1000);
        console.log(value);
      }
      if (value != null && eventInfo[field] !== value) {
        updatedFields[field] = value;
      }
    }
    //console.log("Save changes");
    //console.log("updated Fields are ");
    //console.log(updatedFields);
    //console.log("Collaborators: " + collaborators);
    //console.log("Additional Info: " + additionalInfo);

    // Reset updated details
    setUpdatedDetails({
      name: null,
      budget: null,
      location: null,
      date: null,
    });

    const controller = new AbortController();
    try {
      const userId = jwtDecode(auth.accessToken).userInfo.id;
      const eventId = state.state.eventId;
      updatedFields.collaborators = collaborators.map(
        (collaborator) => collaborator.email
      );
      updatedFields.additionalInfo = additionalInfo;
      //console.log(updatedFields.collaborators);
      //console.log("Event ID: " + eventId);
      const response = await axiosPrivate.patch(
        `/users/${userId}/events/${eventId}`,
        updatedFields,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      //console.log(response.data);
      setEventInfo(response.data.event);
      setCollaborators(response.data.event.collaborators);
      setAdditionalInfo(response.data.event.additionalInfo);

      setIsModalOpen(false);
      toast.success("Event details updated successfully!");
    } catch (err) {
      console.log(err.response.data.error[0].msg);
      toast.error(err.response.data.error[0].msg);
    }
  };

  // Present additional info
  const additionalInfoPresent = () => {
    return (
      <div>
        <ListGroup className="mr-5 mt-5">
          {additionalInfo.map((info) => (
            <ListGroup.Item key={info}>{info}</ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    );
  };

  // Present collaborators
  const collaboratorsPresent = () => {
    return (
      <div className="mt-5">
        {/* Collabs */}
        <Dropdown
          label="Collaborators"
          dismissOnClick={false}
          outline
          gradientDuoTone={"pinkToOrange"}
        >
          {collaborators.length > 0 ? (
            collaborators.map((c) => (
              <Dropdown.Item key={c._id}>
                {c.username} | {c.email}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item>No Collaborators!</Dropdown.Item>
          )}
        </Dropdown>
      </div>
    );
  };

  // Edit collaborators functionality
  const handleAddCollaborator = () => {
    setCollaborators([...collaborators, { email: "" }]);
  };

  const handleRemoveCollaborator = (index) => {
    const newCollaborators = [...collaborators];
    newCollaborators.splice(index, 1);
    setCollaborators(newCollaborators);
  };

  const handleCollaboratorChange = (index, value) => {
    const newCollaborators = [...collaborators];
    newCollaborators[index].email = value;
    setCollaborators(newCollaborators);
    //console.log(collaborators);
  };

  // Edit additional info functionality
  const handleAddAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, ""]);
  };

  const handleRemoveAdditionalInfo = (index) => {
    const newAdditionalInfo = [...additionalInfo];
    newAdditionalInfo.splice(index, 1);
    setAdditionalInfo(newAdditionalInfo);
  };

  const handleAdditionalInfoChange = (index, value) => {
    const newAdditionalInfo = [...additionalInfo];
    newAdditionalInfo[index] = value;
    setAdditionalInfo(newAdditionalInfo);
  };

  return (
    <div className=" h-screen flex flex-col">
      <Toaster />
      <h1 className=" p-4 text-xl font-bold">{eventInfo.name}</h1>

      {/* First area - Event Details*/}
      <Card className=" p-4">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Details
        </h5>
        {displayEventDetails()}
        <div className="flex justify-between">
          <Button
            gradientDuoTone="purpleToBlue"
            size="lg"
            onClick={() =>
              navigate(`/eventVendors`, {
                state: { eventId: eventID },
              })
            }
          >
            Event Vendors
          </Button>
          <Button
            size={"lg"}
            className="w-30 "
            gradientDuoTone={"greenToBlue"}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Edit Details
          </Button>
        </div>
      </Card>
      <div className="grid grid-rows-2 md:grid-cols-2 gap-8 p-8">
        {/* Second area - Task List */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tasks
          </h5>
          {taskAnalytics.length === 1 ? (
            <p className="">No tasks yet</p>
          ) : (
            <Chart
              chartType="PieChart"
              data={taskAnalytics}
              options={options}
            />
          )}
          <Button
            onClick={() =>
              navigate(`/taskList`, {
                state: { eventId: eventID },
              })
            }
          >
            Go to Tasks
          </Button>
        </Card>

        {/* Third area - GuestList */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Guests
          </h5>
          {guestAnalytics.length === 1 ? (
            <p className="">No guests yet</p>
          ) : (
            <Chart
              chartType="PieChart"
              data={guestAnalytics}
              options={options}
            />
          )}
          <Button
            onClick={() =>
              navigate(`/guestList`, {
                state: { eventId: eventID },
              })
            }
          >
            Go to Guests
          </Button>
        </Card>
      </div>

      {/* Edit Event Details Details */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-5">
          <form>
            <h3 className="text-lg font-bold mb-3">Edit your event details</h3>

            {/* Event Name */}
            <div>
              <div className="m-2 block">
                <Label htmlFor="name" value="Event Name" />
              </div>
              <TextInput
                id="name"
                type="name"
                placeholder={eventInfo.name}
                name={"name"}
                onChange={handleInputChange}
              />
            </div>

            {/* Event Budget */}
            <div>
              <div className="m-2 block">
                <Label htmlFor="budget" value="Event Budget" />
              </div>
              <TextInput
                id="budget"
                type="number"
                placeholder={eventInfo.budget}
                name={"budget"}
                onChange={handleInputChange}
              />
            </div>

            {/* Event Location */}
            <div>
              <div className="m-2 block">
                <Label htmlFor="location" value="Event Location" />
              </div>
              <TextInput
                id="location"
                type="text"
                placeholder={eventInfo.location}
                name={"location"}
                onChange={handleInputChange}
              />
            </div>

            {/* Event Date */}
            <div>
              <div className="m-2 block">
                <Label htmlFor="date" value="Event Date" />
              </div>
              <TextInput
                id="date"
                type="date"
                name={"date"}
                onChange={handleInputChange}
              />
            </div>

            {/* Collaborators */}
            <div className="mt-4">
              <Label htmlFor="collaborators" value="Collaborators" />
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center mb-2">
                  <TextInput
                    value={collaborator.email}
                    onChange={(e) =>
                      handleCollaboratorChange(index, e.target.value)
                    }
                    className="flex-grow"
                  />
                  <Button
                    color="red"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleRemoveCollaborator(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button color="blue" size="sm" onClick={handleAddCollaborator}>
                Add Collaborator
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-4">
              <Label htmlFor="additionalInfo" value="Additional Info" />
              {additionalInfo.map((info, index) => (
                <div key={index} className="flex items-center mb-2">
                  <TextInput
                    value={info}
                    onChange={(e) =>
                      handleAdditionalInfoChange(index, e.target.value)
                    }
                    className="flex-grow"
                  />
                  <Button
                    color="red"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleRemoveAdditionalInfo(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button color="blue" size="sm" onClick={handleAddAdditionalInfo}>
                Add Info
              </Button>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end mt-5">
              <Button
                color={"green"}
                size="sm"
                className="mr-3"
                onClick={handleSaveChanges}
              >
                Save
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
