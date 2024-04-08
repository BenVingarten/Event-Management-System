import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import { IoIosArrowDropdownCircle } from "react-icons/io";

const Header = () => {
  const [userConnected, setUserConnected] = useState(false);

  return (
    <header className="py-4 px-6 flex justify-between border-b-2 border-b-black">
      <Link to="/" className="flex items-center">
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
            <span className="block text-md font-medium ">User Name</span>
            <span className="block truncate text-sm font-bold border-b-2">
              User@Email.com
            </span>
          </Dropdown.Header>
          <Link to="/myEvents" className="font-medium">
            <Dropdown.Item>My Events</Dropdown.Item>
          </Link>
          <Link to="/createEvent" className="font-medium">
            <Dropdown.Item>Create Event</Dropdown.Item>
          </Link>
          <Dropdown.Divider />
          <Dropdown.Item className="font-medium ">Sign out</Dropdown.Item>
        </Dropdown>
      ) : (
        <div className="flex ">
          <Link
            to="/login"
            className="mr-4 outline outline-1 outline-offset-0 py-1 px-1 rounded-2xl outline-blue-500 hover:bg-gradient-to-r from-indigo-500 to-blue-400 hover:outline-transparent"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="outline outline-1 outline-offset-0 py-1 px-1 rounded-2xl outline-blue-500 hover:bg-gradient-to-r from-indigo-500 to-blue-400 hover:outline-transparent"
          >
            Sign-Up
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
