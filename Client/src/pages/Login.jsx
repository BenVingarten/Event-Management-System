import { Spinner } from "flowbite-react";
import { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import OAuthLogin from "../components/OAuthLogIn";
import AuthContext from "../context/AuthProvider";
import axios from "../api/axios.js";

const LOGIN_URL = "http://localhost:4000/login";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { setAuth } = useContext(AuthContext);

  const handleUserNameChange = (e) => {
    setUserName(e.target.value.trim());
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        LOGIN_URL,
        JSON.stringify({ username: userName, password: password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(JSON.stringify(res?.data));
      toast.success("Logged in successfully");
      const accessToken = res?.data?.accessToken;
      const role = res?.data?.role;
      setAuth({ userName, password, role, accessToken });
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response.data.message);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Toaster position="top-center" reverseOrder={true} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <label
            htmlFor="userName"
            className="block text-gray-700 font-bold mb-2"
          >
            User Name
          </label>
          <input
            type="name"
            id="userName"
            value={userName}
            onChange={handleUserNameChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-6">
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
        <button
          type="submit"
          className="w-full mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span className="pl-3">Loading...</span>
            </>
          ) : (
            "Log In"
          )}
        </button>
        <OAuthLogin />
      </form>
    </div>
  );
};

export default LoginPage;
