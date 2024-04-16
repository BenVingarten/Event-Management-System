import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const userData = {
      username: userName,
      password: password,
    };

    try {
      const response = await fetch(`http://localhost:4000/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You might need to include additional headers like authorization token, etc.
        },
        body: JSON.stringify(userData), // Assuming userData is an object containing registration data
      });

      if (!response.ok) {
        // Handle error response
        const resData = await response.json();
        const errorMessage = resData.err;
        throw new Error(errorMessage);
      }

      // Registration successful
      toast.success("Login successful");
    } catch (error) {
      toast.error("Error: " + error.message);
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
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
