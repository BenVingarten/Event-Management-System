import { Chart } from "react-google-charts";
import {
  Button,
  Card,
  Dropdown,
  Label,
  ListGroup,
  Modal,
  Radio,
  Spinner,
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

import { locations, eventTypes } from "../constants";

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
  const userId = jwtDecode(auth.accessToken).userInfo.id;

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] =
    useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({
    name: "",
    budget: "",
    location: "",
    date: "",
    type: "",
  });
  const [newCollab, setNewCollab] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //console.log(eventInfo);
  // Fetch event details
  const effectRun = useRef(false);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getInfo = async () => {
      try {
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
  }, [isDetailsModalOpen]);

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

          {userId === eventInfo.owner && collaboratorsPresent()}
        </div>
      </div>
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "radio" ? value : value,
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

    // Reset updated details
    setUpdatedDetails({
      name: null,
      budget: null,
      location: null,
      date: null,
      type: null,
    });

    const controller = new AbortController();
    try {
      const eventId = state.state.eventId;

      updatedFields.collaborators = collaborators.map(
        (collaborator) => collaborator.email
      );

      updatedFields.additionalInfo = additionalInfo;
      console.log(updatedFields);
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

      setIsDetailsModalOpen(false);
      toast.success("Event details updated successfully!");
    } catch (err) {
      console.log(err.response);
      toast.error(err.response.data.err);
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
            collaborators.map((c, index) => (
              <Dropdown.Item key={index}>
                {c.email} {c.status && " | " + c.status}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item>No Collaborators!</Dropdown.Item>
          )}
          <Dropdown.Item className="flex justify-center">
            <Button
              color="blue"
              outline
              onClick={() => setIsCollaboratorsModalOpen(true)}
            >
              Edit Collaborators
            </Button>
          </Dropdown.Item>
        </Dropdown>
      </div>
    );
  };

  // Edit collaborators functionality
  const handleAddCollaborator = async () => {
    const controller = new AbortController();
    //console.log(newCollab);
    try {
      setIsLoading(true);
      const response = await axiosPrivate.post(
        `/users/${userId}/events/${eventID}/collaborators`,
        { email: newCollab },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      setIsLoading(false);
      toast.success("Collaborator added successfully, Email sent!");
      console.log(response);
      setCollaborators([...collaborators, response.data.newCollaborator]);
      setNewCollab("");
    } catch (error) {
      setIsLoading(false);
      console.error("Error Adding Collab:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.err);
    }

    console.log(collaborators);
  };

  const handleRemoveCollaborator = (index) => {
    const deleteCollab = collaborators[index];
    const controller = new AbortController();
    setIsLoading(true);
    try {
      axiosPrivate.delete(`/users/${userId}/events/${eventID}/collaborators/`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        signal: controller.signal,
        data: deleteCollab,
      });
      toast.success("Collaborator removed successfully!");
      setIsLoading(false);
      const newCollaborators = [...collaborators];
      newCollaborators.splice(index, 1);
      setCollaborators(newCollaborators);
    } catch (error) {
      setIsLoading(false);
      console.error("Error Removing Collab:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.error[0].msg);
    }
  };

  const handleNewCollabChange = (value) => {
    setNewCollab(value);
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

  useEffect(() => {
    if (isDetailsModalOpen) {
      setUpdatedDetails({
        name: eventInfo.name || "",
        budget: eventInfo.budget || "",
        location: eventInfo.location || "",
        date: eventInfo.date
          ? moment(eventInfo.date * 1000).format("YYYY-MM-DD")
          : "",
        type: eventInfo.type || "",
      });
    }
  }, [isDetailsModalOpen, eventInfo]);

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

          {userId === eventInfo.owner && (
            <Button
              size={"lg"}
              className="w-30 "
              gradientDuoTone={"greenToBlue"}
              onClick={() => {
                setIsDetailsModalOpen(true);
              }}
            >
              Edit Details
            </Button>
          )}
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
      <Modal
        show={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      >
        <div className="p-5 overflow-auto">
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
              <ListGroup>
                {locations.map((location) => (
                  <ListGroup.Item
                    key={location.value}
                    className="flex items-center"
                  >
                    <Radio
                      id={location.value}
                      name="location"
                      value={location.value}
                      checked={updatedDetails.location === location.value}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor={location.value}>{location.label}</label>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            {/* Event Type */}
            <div>
              <div className="m-2 block">
                <Label htmlFor="type" value="Event Type" />
              </div>
              <ListGroup>
                {eventTypes.map((event) => (
                  <ListGroup.Item
                    key={event.value}
                    className="flex items-center"
                  >
                    <Radio
                      id={event.value}
                      name="type"
                      value={event.value}
                      checked={updatedDetails.type === event.value}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor={event.value}>{event.label}</label>
                  </ListGroup.Item>
                ))}
              </ListGroup>
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
              <Button size="sm" onClick={() => setIsDetailsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Collaborators Modal */}
      <Modal
        show={isCollaboratorsModalOpen}
        onClose={() => setIsCollaboratorsModalOpen(false)}
      >
        <div className="p-5">
          <h3 className="text-lg font-bold mb-3">Edit Collaborators</h3>

          {/* Collaborators */}
          <div className="mt-4">
            <Label htmlFor="collaborators" value="Collaborators" />
            {collaborators.map((collaborator, index) => (
              <div key={index} className="flex items-center mb-2">
                <TextInput
                  value={collaborator.email}
                  onChange={(e) => handleNewCollabChange(index, e.target.value)}
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
            {/* Add Collaborator */}
            <div className="flex items-center mb-2">
              <TextInput
                value={newCollab}
                type="email"
                placeholder="Enter new collaborator email"
                onChange={(e) => handleNewCollabChange(e.target.value)}
                className="flex-grow"
              />
              {isLoading ? (
                <Spinner size="lg" />
              ) : (
                <Button
                  color="green"
                  size="sm"
                  className="ml-2"
                  onClick={() => handleAddCollaborator()}
                >
                  Add
                </Button>
              )}
            </div>
          </div>

          <Button
            color={"red"}
            onClick={() => setIsCollaboratorsModalOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
