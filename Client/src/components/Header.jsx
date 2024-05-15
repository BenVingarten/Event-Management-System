import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import useLogout from "../hooks/useLogout";

import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";

const Header = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  const [userConnected, setUserConnected] = useState(false);
  const [logoLink, setLogoLink] = useState(userConnected ? "myEvents" : "/");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserConnected(auth?.user ? true : false);
    setLogoLink(userConnected ? "myEvents" : "/");
    setEmail(localStorage.getItem("email") || "");
    setUserName(localStorage.getItem("userName") || "");
  }, [auth, userConnected]);

  const signout = async () => {
    localStorage.setItem("persist", false);
    localStorage.setItem("userName", "");
    localStorage.setItem("email", "");
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="py-4 px-6 flex justify-between">
      <Link to={logoLink} className="flex items-center">
        <span className="text-xl font-bold mr-4 bg bg-gradient-to-r from-indigo-500 to-blue-400 rounded-lg text-white px-2 py-1 ">
          Event Planner
        </span>
      </Link>

      {userConnected ? (
        <Dropdown
          dismissOnClick={false}
          color="Blue"
          arrowIcon={<IoIosArrowDropdownCircle />}
          className="bg-gradient-to-r from-indigo-500 to-blue-400 "
        >
          <Dropdown.Header>
            <span className="block text-md font-medium ">{userName}</span>
            <span className="block truncate text-sm font-bold border-b-2">
              {email}
            </span>
          </Dropdown.Header>
          <Link to="/myEvents" className="font-medium">
            <Dropdown.Item>My Events</Dropdown.Item>
          </Link>
          <Link to="/createEvent" className="font-medium">
            <Dropdown.Item>Create Event</Dropdown.Item>
          </Link>
          <Link to="/account" className="font-medium">
            <Dropdown.Item>Profile</Dropdown.Item>
          </Link>
          <Dropdown.Divider />
          <Dropdown.Item className="font-medium " onClick={signout}>
            Sign out
          </Dropdown.Item>
        </Dropdown>
      ) : (
        <div className="flex ">
          <Link
            to="/login"
            className="text-white mr-4 outline outline-2 outline-offset-1 py-1 px-2 rounded-2xl outline-white hover:bg-gradient-to-r from-indigo-500 to-blue-400 hover:outline-transparent"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-white mr-4 outline outline-2 outline-offset-1 py-1 px-2 rounded-2xl outline-white hover:bg-gradient-to-r from-indigo-500 to-blue-400 hover:outline-transparent"
          >
            Sign-Up
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
