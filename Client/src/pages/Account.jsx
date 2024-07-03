import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import {
  Button,
  Label,
  TextInput,
  Checkbox,
  ListGroup,
  Textarea,
} from "flowbite-react";
import { locations, eventTypes } from "../constants.js"; // Importing the constants

export default function Account() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const effectRun = useRef(false);

  const userRole = jwtDecode(auth.accessToken).userInfo.role;
  const userId = jwtDecode(auth.accessToken).userInfo.id;

  const [user, setUser] = useState({
    username: "example_user",
    email: "example@example.com",
    eventTypes: [],
    businessLocation: [],
    businessType: "",
    businessDescription: "example_description",
  });

  const [updatedDetails, setUpdatedDetails] = useState({});

  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [eventTypesChanged, setEventTypesChanged] = useState(false);
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState([]);
  const [businessLocationChanged, setBusinessLocationChanged] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "businessLocation") {
      setSelectedBusinessLocation((prevDetails) => {
        const updatedValues = prevDetails.includes(value)
          ? prevDetails.filter((item) => item !== value)
          : [...prevDetails, value];
        return updatedValues;
      });
      setBusinessLocationChanged(true);
    } else if (name === "eventTypes") {
      setSelectedEventTypes((prevDetails) => {
        const updatedValues = prevDetails.includes(value)
          ? prevDetails.filter((item) => item !== value)
          : [...prevDetails, value];
        return updatedValues;
      });
      setEventTypesChanged(true);
    } else {
      setUpdatedDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const changedDetails = { ...updatedDetails };

    if (eventTypesChanged) {
      changedDetails.eventTypes = selectedEventTypes;
    }
    if (businessLocationChanged) {
      changedDetails.businessLocation = selectedBusinessLocation;
    }
    console.log(changedDetails);
    const controller = new AbortController();
    try {
      const response = await axiosPrivate.patch(
        `/users/${userId}`,
        changedDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      setUpdatedDetails({});
      setUser(response.data.user);
      setSelectedEventTypes(response.data.user.eventTypes);
      setSelectedBusinessLocation(response.data.user.businessLocation);
      toast.success("Details updated successfully");
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.err);
    }
  };

  //console.log(user);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/users/${userId}/`, {
          signal: controller.signal,
        });

        setUser(response.data.user);
        setSelectedEventTypes(response.data.user.eventTypes);
        setSelectedBusinessLocation(response.data.user.businessLocation);
      } catch (err) {
        console.log("Error: " + err.response);
        console.log(err);
        toast.error("Failed fetching user details. Try again.");
      }
    };

    if (effectRun.current) fetchUserDetails();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
  }, []);

  return (
    <div className="ml-5">
      <Toaster />
      <h1 className="font-bold text-xl">User Profile</h1>
      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
        <div className="grid grid-cols-2">
          {/* Every User + business description for vendors */}
          <div className="pr-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Your username" />
              </div>
              <TextInput
                id="username"
                name="username"
                type="text"
                defaultValue={user.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput
                id="email1"
                name="email"
                type="email"
                defaultValue={user.email}
                onChange={handleInputChange}
              />
            </div>
            {/* Business Description */}
            {userRole === "Vendor" ? (
              <div className="">
                <div className="mb-2 block">
                  <Label
                    htmlFor="businessDescription"
                    value="Business description"
                  />
                </div>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  type="text"
                  defaultValue={user.businessDescription}
                  onChange={handleInputChange}
                />

                <div className="mb-2 block">
                  <Label htmlFor="businessType" value="Business type" />
                </div>
                <TextInput
                  id="businessType"
                  name="businessType"
                  type="text"
                  defaultValue={user.businessType}
                  onChange={handleInputChange}
                />
              </div>
            ) : null}
          </div>
          {/* Only Vendors */}
          {userRole === "Vendor" ? (
            <div>
              {/* Event Types */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="eventTypes" value="Event Types" />
                </div>
                <ListGroup>
                  {eventTypes.map((event) => (
                    <ListGroup.Item
                      key={event.value}
                      className="flex items-center"
                    >
                      <Checkbox
                        id={event.value}
                        name="eventTypes"
                        value={event.value}
                        checked={selectedEventTypes.includes(event.value)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label htmlFor={event.value}>{event.label}</label>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
              {/* Business Location */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="businessLocation" value="Business location" />
                </div>
                <ListGroup>
                  {locations.map((location) => (
                    <ListGroup.Item
                      key={location.value}
                      className="flex items-center"
                    >
                      <Checkbox
                        id={location.value}
                        name="businessLocation"
                        value={location.value}
                        checked={selectedBusinessLocation.includes(
                          location.value
                        )}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label htmlFor={location.value}>{location.label}</label>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          ) : null}
        </div>

        <div className="self-center">
          <Button className="mt-5" type="submit" color={"yellow"}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
