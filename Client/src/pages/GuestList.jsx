import { useEffect, useState, useRef } from "react";
import {
  Table,
  Checkbox,
  Label,
  TextInput,
  Button,
  Select,
} from "flowbite-react";
import { IoMdAddCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import { FaSort } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import { Toaster, toast } from "react-hot-toast";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const GuestListPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const { auth } = useAuth();
  const effectRun = useRef(false);

  const eventID = location.state.eventId;
  const userId = jwtDecode(auth.accessToken).userInfo.id;

  //guests list
  const [guests, setGuests] = useState([]);
  // Selected guests
  const [selectedGuests, setSelectedGuests] = useState([]);
  // Sorting criteria
  const [sortCriteria, setSortCriteria] = useState("name"); // "name", "status", etc.
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  // New guest input fields
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPeopleCount, setNewGuestPeopleCount] = useState(1);
  const [newGuestGroup, setNewGuestGroup] = useState("");
  const [newGuestPhoneNumber, setNewGuestPhoneNumber] = useState("");
  const [newGuestStatus, setNewGuestStatus] = useState("");
  const [newGuestComments, setNewGuestComments] = useState("");

  // Initialize guests
  useEffect(() => {
    const controller = new AbortController();

    const fetchGuests = async () => {
      try {
        const response = await axiosPrivate.get(
          `/users/${userId}/events/${eventID}/guests`,
          {
            signal: controller.signal,
          }
        );

        //console.log(response.data.guestList);
        setGuests(response.data.guestList);
      } catch (err) {
        console.log("Error: " + err.response?.data.err);
        toast.error("No Guests Found!");
      }
    };

    if (effectRun.current) fetchGuests();

    return () => {
      controller.abort();
      effectRun.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addGuest = async () => {
    const newGuest = {
      name: newGuestName,
      peopleCount: newGuestPeopleCount,
      group: newGuestGroup,
      phoneNumber: newGuestPhoneNumber,
      status: newGuestStatus,
      comments: newGuestComments,
    };

    const controller = new AbortController();
    try {
      const response = await axiosPrivate.post(
        `/users/${userId}/events/${eventID}/guests`,
        newGuest,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Guest added successfully");
      setGuests([...guests, response.data.newGuest]);
    } catch (error) {
      console.error("Error Adding Guest:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.errors[0].msg);
    }

    // Reset input fields
    setNewGuestName("");
    setNewGuestPeopleCount(1);
    setNewGuestGroup("");
    setNewGuestPhoneNumber("");
    setNewGuestStatus("");
    setNewGuestComments("");

    handleClearFields();
  };

  const nameRef = useRef("");
  const peopleCountRef = useRef(1);
  const groupRef = useRef("");
  const phoneNumberRef = useRef("");
  const statusRef = useRef("");
  const commentsRef = useRef("");
  const handleClearFields = () => {
    nameRef.current.value = "";
    peopleCountRef.current.value = 1;
    groupRef.current.value = "";
    phoneNumberRef.current.value = "";
    statusRef.current.value = "";
    commentsRef.current.value = "";
  };

  //console.log(guests);

  const handleRemoveGuests = async () => {
    const selectedGuestsIDs = selectedGuests.map((index) => guests[index]._id);
    const controller = new AbortController();
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axiosPrivate.delete(
        `/users/${userId}/events/${eventID}/guests`,
        {
          data: { selectedGuestsIDs },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Guests deleted successfully");
      setGuests(
        guests.filter((guest, index) => !selectedGuests.includes(index))
      );
      setSelectedGuests([]);
    } catch (error) {
      console.error("Error Delete Guest:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.errors[0].msg);
    }
  };

  const handleSelectGuest = (index) => {
    if (selectedGuests.includes(index)) {
      setSelectedGuests(
        selectedGuests.filter((selectedIndex) => selectedIndex !== index)
      );
    } else {
      setSelectedGuests([...selectedGuests, index]);
    }
  };

  const handleStatusChange = async (index, status) => {
    const updatedGuests = [...guests];
    updatedGuests[index].status = status;

    // Update guest status on the server
    const controller = new AbortController();
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axiosPrivate.patch(
        `/users/${userId}/events/${eventID}/guests/${guests[index]._id}`,
        { status: status },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Guest status changed successfully");
      setGuests(updatedGuests);
    } catch (error) {
      console.error("Error Changing Guest Status:", error.response?.data);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.errors[0].msg);
    }
  };

  const handlePeopleCountChange = async (index, peopleCount) => {
    const updatedGuests = [...guests];
    updatedGuests[index].peopleCount = peopleCount;

    // Update guest people count on the server
    const controller = new AbortController();
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axiosPrivate.patch(
        `/users/${userId}/events/${eventID}/guests/${guests[index]._id}`,
        { peopleCount: peopleCount },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );
      toast.success("Guest Guests changed successfully");
      setGuests(updatedGuests);
    } catch (error) {
      console.error(
        "Error Changing Guest amount of guests:",
        error.response?.data
      );
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response?.data.errors[0].msg);
    }
  };

  // Sorting guests based on criteria and order
  const sortedGuests = guests.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortCriteria].localeCompare(b[sortCriteria]);
    } else {
      return b[sortCriteria].localeCompare(a[sortCriteria]);
    }
  });

  const handleSort = (criteria) => {
    if (sortCriteria === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortCriteria(criteria);
      setSortOrder("asc");
    }
  };

  const presentList = () => {
    return sortedGuests.map((guest, index) => (
      <Table.Row key={index}>
        <Table.Cell>
          {" "}
          <Checkbox onChange={() => handleSelectGuest(index)} />{" "}
        </Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.name}</Table.Cell>
        <Table.Cell className="px-4 py-2 ">
          <input
            type="number"
            id="guests"
            value={guest.peopleCount}
            onChange={(e) => handlePeopleCountChange(index, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.group}</Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.phoneNumber}</Table.Cell>
        <Table.Cell className="px-4 py-2">
          <select
            value={guest.status}
            onChange={(e) => handleStatusChange(index, e.target.value)}
            className="px-2 py-1 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select status</option>
            <option value="Message Sent">Message Sent</option>
            <option value="Coming">Coming</option>
            <option value="Not Coming">Not Coming</option>
            <option value="Maybe">Maybe</option>
            <option value="">Blank</option>
          </select>
        </Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.comments}</Table.Cell>
      </Table.Row>
    ));
  };

  useEffect(() => {
    presentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests]);

  return (
    <div className="container mx-auto px-2 py-8">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Guest List</h2>
      <form className="flex gap-2 pb-5">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Name" />
          </div>
          <TextInput
            id="name1"
            type="text"
            placeholder="name"
            ref={nameRef}
            onChange={(e) => setNewGuestName(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="People Count" value="Guests" />
          </div>
          <TextInput
            id="People"
            type="number"
            min="0"
            ref={peopleCountRef}
            onChange={(e) => setNewGuestPeopleCount(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="Group" value="Group" />
          </div>
          <TextInput
            id="Group"
            type="text"
            ref={groupRef}
            onChange={(e) => setNewGuestGroup(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="phone-input"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Phone number:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 19 18"
              >
                <path d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z" />
              </svg>
            </div>
            <input
              type="text"
              id="phone-input"
              aria-describedby="helper-text-explanation"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              pattern="[0-9]{3}-[0-9]{3}[0-9]{4}"
              placeholder="050-4567890"
              ref={phoneNumberRef}
              onChange={(e) => setNewGuestPhoneNumber(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="max-w-md">
          <div className="mb-2 block">
            <Label htmlFor="Status" value="Status" />
          </div>
          <Select
            id="status"
            ref={statusRef}
            onChange={(e) => setNewGuestStatus(e.target.value)}
            required
          >
            <option> - </option>
            <option>Message Sent</option>
            <option>Coming</option>
            <option>Not Coming</option>
            <option>Maybe</option>
          </Select>
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="Comments" value="Comments" />
          </div>
          <TextInput
            id="Comments"
            type="text"
            ref={commentsRef}
            onChange={(e) => setNewGuestComments(e.target.value)}
            required
          />
        </div>

        <Button
          size="sm"
          className="flex items-center justify-center"
          color="Transparent"
          pill
          type="button"
          onClick={addGuest}
        >
          <IoMdAddCircle size={35} />
        </Button>
      </form>
      <div className="pb-2">
        <Button
          className="flex items-center justify-center"
          color="red"
          onClick={handleRemoveGuests}
        >
          {" "}
          <IoIosRemoveCircleOutline size={20} />
          Remove Selected Guests
        </Button>
      </div>

      <Table className="w-full mb-4">
        <Table.Head>
          <Table.HeadCell>
            {" "}
            <Checkbox />{" "}
          </Table.HeadCell>
          <Table.HeadCell
            className="px-4 py-2 hover:cursor-pointer"
            onClick={() => handleSort("name")}
          >
            <div className="flex items-center">
              Name
              <FaSort className="ml-1" />
            </div>
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Guests</Table.HeadCell>
          <Table.HeadCell
            className="px-4 py-2 hover:cursor-pointer "
            onClick={() => handleSort("group")}
          >
            <div className="flex items-center">
              Group
              <FaSort className="ml-1" />
            </div>
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Phone Number</Table.HeadCell>
          <Table.HeadCell
            className="px-4 py-2 hover:cursor-pointer"
            onClick={() => handleSort("status")}
          >
            <div className="flex items-center">
              Status
              <FaSort className="ml-1" />
            </div>
          </Table.HeadCell>
          <Table.HeadCell
            className="px-4 py-2 hover:cursor-pointer"
            onClick={() => handleSort("comments")}
          >
            <div className="flex items-center">
              Comments
              <FaSort className="ml-1" />
            </div>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>{presentList()}</Table.Body>
      </Table>
    </div>
  );
};

export default GuestListPage;
