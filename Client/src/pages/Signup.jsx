import { Label, Select } from "flowbite-react";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OAuthSignUp from "../components/OAuthSignUp";
import { useDispatch } from "react-redux";
import { signUpSuccess, signUpFailure } from "../redux/user/userSlice";

import axios from "../api/axios";
const SIGNUP_URL = "http://localhost:4000/register";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Event Planner");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
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

    const userData = {
      username: userName,
      email: email,
      password: password,
      role: role,
    };
    console.log(userData);
    try {
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");

      const response = await axios.post(
        SIGNUP_URL,
        JSON.stringify({
          username: userName,
          email: email,
          password: password,
          role: role,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(response.accessToken);
    } catch (error) {
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.message);
    }
  }

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
    </div>
  );
};

export default SignupPage;
