import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import { Button, Label, TextInput } from "flowbite-react";

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
  };
  //console.log(updatedDetails);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    const controller = new AbortController();
    try {
      //console.log(updatedDetails);
      const response = await axiosPrivate.patch(
        `/users/${userId}`,
        updatedDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      //console.log(response);
      setUpdatedDetails({});
      setUser((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
      toast.success("details updated successfully");
      //console.log(response.data.event);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    // Fetch user's events from the backend

    const fetchUserDetails = async () => {
      try {
        const response = await axiosPrivate.get(`/users/${userId}/`, {
          signal: controller.signal,
        });

        setUser(response.data.user);
        //setUpdatedDetails(response.data.user);
        //console.log(response.data);
        //console.log("User details fetched");
        //console.log(user);
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
          </div>
          {userRole == "Vendor" ? (
            <div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="type" value="Business type" />
                </div>
                <TextInput
                  id="businessType"
                  name="businessType"
                  type="text"
                  value={updatedDetails.businessType}
                  onChange={handleInputChange}
                  placeholder={user.businessType}
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
                  value={updatedDetails.businessLocation}
                  onChange={handleInputChange}
                  placeholder={user.businessLocation}
                />
              </div>
            </div>
          ) : null}
        </div>
        {userRole == "Vendor" ? (
          <div className="">
            <div className="mb-2 block">
              <Label htmlFor="type" value="Business description" />
            </div>
            <TextInput
              id="businessDescription"
              name="businessDescription"
              type="text"
              value={updatedDetails.businessDescription}
              onChange={handleInputChange}
              placeholder={user.businessDescription}
            />
          </div>
        ) : null}
        <div className="self-center">
          <Button className="mt-5" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
