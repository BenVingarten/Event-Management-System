// src/components/HomePage.jsx

import { useState } from "react";
import { FaUsers, FaTasks, FaRegCalendarAlt } from "react-icons/fa";
import { Card, Button } from "flowbite-react";
import CollabImage from "../images/Collab.png";
import GuestListImage from "../images/GuestList.png";
import TaskListImage from "../images/TaskList.png";

const HomePage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleButtonClick = (imageName) => {
    setSelectedImage(imageName);
  };

  const imageMap = {
    Collab: CollabImage,
    GuestList: GuestListImage,
    TaskList: TaskListImage,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Welcome to Event Planner
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <FaUsers className="text-4xl text-blue-500" />
            <h2 className="text-xl font-semibold ml-4">Guest List</h2>
          </div>
          <p className="mt-2">
            Manage your guest list efficiently. Add, edit, or remove guests with
            ease.
          </p>
          <Button
            className="mt-4 w-full"
            gradientMonochrome="info"
            onClick={() => handleButtonClick("GuestList")}
          >
            Manage Guests
          </Button>
        </Card>

        <Card>
          <div className="flex items-center">
            <FaTasks className="text-4xl text-green-500" />
            <h2 className="text-xl font-semibold ml-4">Tasks</h2>
          </div>
          <p className="mt-2">
            Stay organized with our task management tool. Track your progress
            and get suggestions for tasks.
          </p>
          <Button
            className="mt-4 w-full"
            gradientMonochrome="success"
            onClick={() => handleButtonClick("TaskList")}
          >
            View Tasks
          </Button>
        </Card>

        <Card>
          <div className="flex items-center">
            <FaRegCalendarAlt className="text-4xl text-purple-500" />
            <h2 className="text-xl font-semibold ml-4">Collaborate</h2>
          </div>
          <p className="mt-2">
            Collaborate with your team to plan the perfect event. Share tasks
            and updates in real-time.
          </p>
          <Button
            className="mt-4 w-full"
            gradientMonochrome="purple"
            onClick={() => handleButtonClick("Collab")}
          >
            Collaborate Now
          </Button>
        </Card>
      </div>

      {selectedImage && (
        <div className="mt-8 flex justify-center">
          <img src={imageMap[selectedImage]} alt="Selected" className="" />
        </div>
      )}
    </div>
  );
};

export default HomePage;
