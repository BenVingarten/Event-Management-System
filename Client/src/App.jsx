import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import GuestList from "./pages/GuestList";
import TaskList from "./pages/TaskList";
import Vendors from "./pages/Vendors";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/createEvent" element={<CreateEvent />} />
        <Route path="/eventDetails" element={<EventDetails />} />
        <Route path="/guestList" element={<GuestList />} />
        <Route path="/taskList" element={<TaskList />} />
        <Route path="/vendors" element={<Vendors />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
