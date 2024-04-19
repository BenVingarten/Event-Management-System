import { BrowserRouter, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import GuestList from "./pages/GuestList";
import TaskList from "./pages/TaskList";
import MyEvents from "./pages/MyEvents";
import Header from "./components/Header";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="bg-gradient-to-b from-indigo-300 to-transparent">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="unauthorized" element={<h1>Unauthorized</h1>} />

            {/* private routes - Event Planner, Vendor & Admin */}
            {/* All */}
            <Route
              element={
                <RequireAuth
                  allowedRoles={["admin", "Event Planner", "Vendor"]}
                />
              }
            >
              <Route path="createEvent" element={<CreateEvent />} />
              <Route path="eventDetails" element={<EventDetails />} />
              <Route path="guestList" element={<GuestList />} />
              <Route path="taskList" element={<TaskList />} />
              <Route path="myEvents" element={<MyEvents />} />
            </Route>
            {/* Vendors */}
            {/* will be added later */}
            <Route element={<RequireAuth allowedRoles={["Vendor"]} />}>
              <Route path="vendors" element={<h1>Only Vendors</h1>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
