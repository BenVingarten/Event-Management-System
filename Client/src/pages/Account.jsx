import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Label, TextInput } from "flowbite-react";

export default function Account() {
  const axiosPrivate = useAxiosPrivate();
  const auth = useAuth();
  const effectRun = useRef(false);

  const userRole = auth?.auth?.role;

  const [user, setUser] = useState({
    username: "example_user",
    email: "example@example.com",
    password: "example_password",
    businessType: "example_business",
    businessLocation: "example_location",
    businessDescription: "example_description",
  });

  // State for edited user information
  const [editedUser, setEditedUser] = useState({
    username: "",
    email: "",
    password: "",
    businessType: "",
    businessLocation: "",
    businessDescription: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user state with edited user information
    setUser({ ...user, ...editedUser });
    // Clear editedUser state
    setEditedUser({
      username: "",
      email: "",
      password: "",
      businessType: "",
      businessLocation: "",
      businessDescription: "",
    });
    //TODO: Send edited user information to the backend
  };

  useEffect(() => {
    const controller = new AbortController();

    // Fetch user's events from the backend

    const fetchUserDetails = async () => {
      try {
        const userId = jwtDecode(auth.accessToken).userInfo.id;
        const response = await axiosPrivate.get(`/users/${userId}/`, {
          signal: controller.signal,
        });

        console.log(response.data);
        //TODO: Set user state with fetched user information
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
            type="text"
            value={editedUser.businessType || user.businessType}
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
            type="text"
            value={editedUser.businessLocation || user.businessLocation}
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
            type="text"
            value={editedUser.businessDescription || user.businessDescription}
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
                type="text"
                value={editedUser.username || user.username}
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
                type="email"
                value={editedUser.email || user.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" value="Your password" />
              </div>
              <TextInput
                id="password1"
                type="password"
                placeholder="Enter your password"
                onChange={handleInputChange}
                required
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
