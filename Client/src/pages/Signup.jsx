import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OAuthSignUp from "../components/OAuthSignUp";

import axios from "../api/axios";
const SIGNUP_URL = "http://localhost:4000/register";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Event Planner");
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessType: "",
    businessLocation: "",
    businessDescription: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    e.target.value == "Vendor" ? setIsModalOpen(true) : setIsModalOpen(false);
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");

      const userInfo = {
        username: userName,
        email: email,
        password: password,
        role: role,
      };

      if (role === "Vendor") {
        //setIsModalOpen(true);
        userInfo.businessName = businessInfo.businessName;
        userInfo.businessType = businessInfo.businessType;
        userInfo.businessLocation = businessInfo.businessLocation;
        userInfo.businessDescription = businessInfo.businessDescription;
      }

      const response = await axios.post(
        SIGNUP_URL,
        JSON.stringify({
          ...userInfo,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(JSON.stringify(response));
      toast.success("Register successful");
      navigate("/login");
    } catch (error) {
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.message);
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    //console.log(businessInfo);
    setBusinessInfo((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Toaster position="top-center" reverseOrder={true} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
            placeholder="Someone@gmail.com"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="userName"
            className="block text-gray-700 font-bold mb-2"
          >
            User Name
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={handleUserNameChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 font-bold mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="max-w-md mb-5">
          <div className="mb-2 block">
            <Label htmlFor="role" value="Select your account type" />
          </div>
          <Select id="role" required onChange={handleRoleChange}>
            <option>Event Planner</option>
            <option>Vendor</option>
          </Select>
        </div>
        <button
          type="submit"
          className="w-full mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>

        <OAuthSignUp role={role} />
      </form>

      {/*Popup Modal*/}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-5">
          <h3 className="text-lg font-bold mb-3">
            Tell us about your business!
          </h3>
          <div className="">
            <div className="mr-5">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="businessName" value="Business Name" />
                </div>
                <TextInput
                  id="businessName"
                  type="text"
                  value={businessInfo.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="businessType" value="Business type" />
                </div>
                <TextInput
                  id="businessType"
                  type="text"
                  value={businessInfo.businessType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="businessLocation" value="Business location" />
                </div>
                <TextInput
                  id="businessLocation"
                  type="text"
                  value={businessInfo.businessLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="businessDescription"
                    value="Business description"
                  />
                </div>
                <TextInput
                  id="businessDescription"
                  type="text"
                  value={businessInfo.businessDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="items-center">
              <Button
                className="mt-5"
                size="xl"
                onClick={() => setIsModalOpen(false)}
                gradientDuoTone="greenToBlue"
              >
                That's it!
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignupPage;
