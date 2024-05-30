import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import { Button, Label, TextInput } from "flowbite-react";
import { set } from "mongoose";

export default function Account() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const effectRun = useRef(false);

  const userRole = jwtDecode(auth.accessToken).userInfo.role;
  const userId = jwtDecode(auth.accessToken).userInfo.id;

  //console.log(userRole);

  const [user, setUser] = useState({
    username: "example_user",
    email: "example@example.com",
    businessType: "example_business",
    businessLocation: "example_location",
    businessDescription: "example_description",
  });
  const [updatedDetails, setUpdatedDetails] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    console.log(updatedDetails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const controller = new AbortController();
    try {
      console.log(updatedDetails);
      const response = await axiosPrivate.patch(
        `/users/${userId}/`,
        updatedDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      setUpdatedDetails({});
      if (userRole !== "Vendor") {
        setUser({
          username: response.data.user.username,
          email: response.data.user.email,
        });
      } else {
        setUser({
          username: response.data.user.username,
          email: response.data.user.email,
          businessType: response.data.user.businessType,
          businessLocation: response.data.user.businessLocation,
          businessDescription: response.data.user.businessDescription,
        });
      }

      //console.log(response.data.event);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch event info. Please try again later.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    // Fetch user's events from the backend

    const fetchUserDetails = async () => {
      console.log(userId);
      try {
        const response = await axiosPrivate.get(`/users/${userId}/`, {
          signal: controller.signal,
        });

        console.log(response.data.user);

        if (userRole !== "Vendor") {
          setUser({
            username: response.data.user.username,
            email: response.data.user.email,
          });
        } else {
          setUser({
            username: response.data.user.username,
            email: response.data.user.email,
            businessType: response.data.user.businessType,
            businessLocation: response.data.user.businessLocation,
            businessDescription: response.data.user.businessDescription,
          });
        }
        console.log(user);
      } catch (err) {
        console.log("Error: " + err.response?.data);
        toast.error("Failed fetching user details. Try again.");
      }
    };

    if (effectRun.current) fetchUserDetails();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
  }, []);

  const PresentVendorInfo = () => {
    return (
      <div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="type" value="Business type" />
          </div>
          <TextInput
            id="businessType"
            name="businessType"
            type="text"
            value={updatedDetails.businessType || user.businessType}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="type" value="Business location" />
          </div>
          <TextInput
            id="businessLocation"
            name="businessLocation"
            type="text"
            value={updatedDetails.businessLocation || user.businessLocation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="type" value="Business description" />
          </div>
          <TextInput
            id="businessDescription"
            name="businessDescription"
            type="text"
            value={
              updatedDetails.businessDescription || user.businessDescription
            }
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    );
  };

  return (
    <div className="ml-5">
      <Toaster />
      <h1 className="font-bold text-xl">User Profile</h1>
      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
        <div className="grid grid-cols-2">
          <div className="pr-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Your username" />
              </div>
              <TextInput
                id="username"
                name="username"
                type="text"
                value={updatedDetails.username || user.username}
                onChange={handleInputChange}
                required
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
                value={updatedDetails.email || user.email}
                onChange={handleInputChange}
              />
            </div>
            <Button className="mt-5" type="submit">
              Save Changes
            </Button>
          </div>
          {userRole == "Vendor" ? <PresentVendorInfo /> : null}
        </div>
      </form>
    </div>
  );
}
