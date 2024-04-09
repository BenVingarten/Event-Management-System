import { useEffect, useState } from "react";
import {
  Table,
  Checkbox,
  Label,
  TextInput,
  Button,
  Select,
} from "flowbite-react";
import { IoMdAddCircle, IoIosRemoveCircleOutline } from "react-icons/io";

const GuestListPage = () => {
  //guests list
  const [guests, setGuests] = useState([]);

  // New guest input fields
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPeopleCount, setNewGuestPeopleCount] = useState(1);
  const [newGuestGroup, setNewGuestGroup] = useState("");
  const [newGuestPhoneNumber, setNewGuestPhoneNumber] = useState("");
  const [newGuestStatus, setNewGuestStatus] = useState("");
  const [newGuestComments, setNewGuestComments] = useState("");

  // Selected guests
  const [selectedGuests, setSelectedGuests] = useState([]);

  const addGuest = () => {
    const newGuest = {
      name: newGuestName,
      peopleCount: newGuestPeopleCount,
      group: newGuestGroup,
      phoneNumber: newGuestPhoneNumber,
      status: newGuestStatus,
      comments: newGuestComments,
    };
    setGuests([...guests, newGuest]);

    // Reset input fields
    setNewGuestName("");
    setNewGuestPeopleCount(1);
    setNewGuestGroup("");
    setNewGuestPhoneNumber("");
    setNewGuestStatus("");
    setNewGuestComments("");
  };

  const handleRemoveGuests = () => {
    setGuests(guests.filter((guest, index) => !selectedGuests.includes(index)));
    setSelectedGuests([]);
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

  const handleStatusChange = (index, status) => {
    const updatedGuests = [...guests];
    updatedGuests[index].status = status;
    setGuests(updatedGuests);
  };

  const presentList = () => {
    return guests.map((guest, index) => (
      <Table.Row key={index}>
        <Table.Cell>
          {" "}
          <Checkbox />{" "}
        </Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.name}</Table.Cell>
        <Table.Cell className="px-4 py-2">{guest.peopleCount}</Table.Cell>
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
    console.log(guests);
  }, [guests]);

  return (
    <div className="container mx-auto px-2 py-8">
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
        <Button className="flex items-center justify-center" color="red">
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
          <Table.HeadCell className="px-4 py-2">Name</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Guests</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Group</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Phone Number</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Status</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2">Comments</Table.HeadCell>
        </Table.Head>
        <Table.Body>{presentList()}</Table.Body>
      </Table>
    </div>
  );
};

export default GuestListPage;
