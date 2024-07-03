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

const locations = [
  { label: "Haifa & North", value: "Haifa & North" },
  { label: "Hasharon", value: "Hasharon" },
  { label: "Gush Dan", value: "Gush Dan" },
  { label: "Shfela", value: "Shfela" },
  { label: "Jerusalem", value: "Jerusalem" },
  { label: "South(Negev And Eilat)", value: "South(Negev And Eilat)" },
];

const eventTypes = [
  { label: "Wedding", value: "Wedding" },
  { label: "Birthday", value: "Birthday" },
  { label: "Bar/Bat Mitzva", value: "Bar/Bat Mitzva" },
  { label: "Company Event", value: "Company Event" },
  { label: "Conference", value: "Conference" },
];

export default function Account() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const effectRun = useRef(false);

  const userRole = jwtDecode(auth.accessToken).userInfo.role;
  const userId = jwtDecode(auth.accessToken).userInfo.id;

  const [user, setUser] = useState({
    username: "example_user",
    email: "example@example.com",
    businessType: [],
    businessLocation: [],
    businessDescription: "example_description",
  });

  const [updatedDetails, setUpdatedDetails] = useState({
    businessType: [],
    businessLocation: [],
  });

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "businessLocation" || name === "businessType") {
      setUpdatedDetails((prevDetails) => ({
        ...prevDetails,
        [name]: checked
          ? [...prevDetails[name], value]
          : prevDetails[name].filter((item) => item !== value),
      }));
    } else {
      setUpdatedDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const controller = new AbortController();
    try {
      const response = await axiosPrivate.patch(
        `/users/${userId}`,
        updatedDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      setUpdatedDetails({});
      setUser((prevDetails) => ({
        ...prevDetails,
        ...updatedDetails,
      }));
      toast.success("details updated successfully");
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/users/${userId}/`, {
          signal: controller.signal,
        });

        setUser(response.data.user);
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
          {/* Every User */}
          <div className="pr-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Your username" />
              </div>
              <TextInput
                id="username"
                name="username"
                type="text"
                value={updatedDetails.username}
                onChange={handleInputChange}
                placeholder={user.username}
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
                value={updatedDetails.email}
                onChange={handleInputChange}
                placeholder={user.email}
              />
            </div>
            {/* Business Description */}
            {userRole == "Vendor" ? (
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
                  value={updatedDetails.businessDescription}
                  onChange={handleInputChange}
                  placeholder={user.businessDescription}
                />
              </div>
            ) : null}
          </div>
          {/* Only Vendors */}
          {userRole == "Vendor" ? (
            <div>
              {/* Business Type */}
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="businessType" value="Business type" />
                </div>
                <ListGroup>
                  {eventTypes.map((event) => (
                    <ListGroup.Item
                      key={event.value}
                      className="flex items-center"
                    >
                      <Checkbox
                        id={event.value}
                        name="businessType"
                        value={event.value}
                        checked={
                          updatedDetails.businessType.includes(event.value) ||
                          user.businessType.includes(event.value)
                        }
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
                        checked={
                          updatedDetails.businessLocation.includes(
                            location.value
                          ) || user.businessLocation.includes(location.value)
                        }
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
