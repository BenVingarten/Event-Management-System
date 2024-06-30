import { useState, useEffect, useRef } from "react";
import { Button, Card, Modal, TextInput } from "flowbite-react";
import { CiCircleRemove } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";

function EventVendors() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const eventID = location.state.eventId;
  const userId = jwtDecode(auth.accessToken).userInfo.id;
  const effectRun = useRef(false);

  const [eventVendors, setEventVendors] = useState([]);
  const [negotiatiatedVendors, setNegotiatedVendors] = useState([]);
  const [suggestedVendors, setSuggestedVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({
    username: "",
    email: "",
    businessType: "",
  });

  useEffect(() => {
    // fetch event vendors
    // fetch negotiated vendors
    // fetch suggested vendors

    const fetchVendors = async () => {
      try {
        const res = await axiosPrivate.get(
          `users/${userId}/events/${eventID}/vendors`
        );
        console.log(res.data);
        toast.success("Vendors Fetched!");
        //setEventVendors(res.data);
      } catch (err) {
        console.log(err.response.data.err);
        toast.error("Failed to Fetch Vendors!");
      }
    };

    if (effectRun.current) fetchVendors();

    return () => {
      effectRun.current = true;
      setEventVendors(DEFAULT_MY_VENDORS);
      setNegotiatedVendors(DEFAULT_NEGOTIATED_VENDORS);
      setSuggestedVendors(DEFAULT_SUGGESTED_VENDORS);
    };
  }, []);

  const StartNegotiationWithVendor = (vendor) => {
    console.log("Start Negotiation with Vendor");
    toast.success("Email Sent to Vendor!");
    console.log(vendor);
    // Add to Negotiated Vendors
    setNegotiatedVendors((pv) => [...pv, vendor]);
    // Remove from Suggested Vendors
    setSuggestedVendors((pv) =>
      pv.filter((v) => v.username !== vendor.username)
    );
    // Send Email
  };

  const AddVendorToMyVendors = (vendor) => {
    console.log("Add Vendor to My Vendors");
    toast.success("Vendor Added to Event Vendors!");
    console.log(vendor);
    // Add to Event Vendors
    setEventVendors((pv) => [...pv, vendor]);
    // Remove from Negotiated Vendors
    setNegotiatedVendors((pv) =>
      pv.filter((v) => v.username !== vendor.username)
    );
    //
  };

  const RemoveVendorFromNegotiatedVendors = (vendor) => {
    console.log("Remove Vendor from Negotiated Vendors");
    toast.success("Vendor Removed from Negotiated Vendors!");
    console.log(vendor);
    // Remove from Negotiated Vendors
    setNegotiatedVendors((pv) =>
      pv.filter((v) => v.username !== vendor.username)
    );
  };

  const RemoveVendorFromEventVendors = (vendor) => {
    console.log("Remove Vendor from Event Vendors");
    toast.success("Vendor Removed from Event Vendors!");
    console.log(vendor);
    // Remove from Event Vendors
    setEventVendors((pv) => pv.filter((v) => v.username !== vendor.username));
  };

  const AddVendorManually = () => {
    console.log("Add Vendor Manually");
    toast.success("Vendor Added Manually!");
    console.log(newVendor);
    // Add to Event Vendors
    setEventVendors((pv) => [...pv, newVendor]);
    // Close Modal
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    setNewVendor({ ...newVendor, [e.target.id]: e.target.value });
  };

  return (
    <div className="grid sm:grid-rows-3 md:grid-cols-3 pl-5">
      <Toaster />
      {/* Event Vendors */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Event Vendors</h1>
        {eventVendors.map((vendor) => (
          <Card key={vendor.username} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.username}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
              </div>
              <div className="flex justify-end items-center h-full">
                <Button
                  color={"red"}
                  onClick={() => RemoveVendorFromEventVendors(vendor)}
                >
                  Remove Vendor
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <Button color={"green"} onClick={() => setModalOpen(true)}>
          Add Vendor Manually
        </Button>
        <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
          {/* Add Vendor Manually */}

          <form className="p-5 " onSubmit={AddVendorManually}>
            <h1 className="text-2xl font-bold mb-2">Add Vendor Manually</h1>
            <TextInput
              id="username"
              type="text"
              className="p-2"
              placeholder="Vendor Name"
              onChange={handleInputChange}
              required
            />
            <TextInput
              id="email"
              type="email"
              placeholder="Vendor Email"
              className="p-2"
              required
              onChange={handleInputChange}
            />
            <TextInput
              id="businessType"
              type="text"
              className="p-2"
              placeholder="Vendor Business Type"
              onChange={handleInputChange}
              required
            />
            <Button
              color={"green"}
              className="m-2"
              //onClick={AddVendorManually}
              type="submit"
            >
              Add Vendor
            </Button>
            <Button
              color={"red"}
              className="m-2"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
          </form>
        </Modal>
      </div>

      {/* Negotiated Vendors */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Negotiated Vendors</h1>
        {negotiatiatedVendors.map((vendor) => (
          <Card key={vendor.username} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.username}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
              </div>
              <div className="flex justify-end items-center h-full">
                <Button
                  outline
                  gradientDuoTone="greenToBlue"
                  className="mr-2"
                  onClick={() => AddVendorToMyVendors(vendor)}
                >
                  <IoIosAddCircleOutline size={25} />
                </Button>
                <Button
                  outline
                  gradientDuoTone="pinkToOrange"
                  onClick={() => RemoveVendorFromNegotiatedVendors(vendor)}
                >
                  <CiCircleRemove size={25} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Suggested Vendors */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 ">Suggested Vendors</h1>
        {suggestedVendors.map((vendor) => (
          <Card key={vendor.username} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.username}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
              </div>
              <div className="flex justify-end items-center h-full">
                <Button
                  outline
                  gradientDuoTone="cyanToBlue"
                  onClick={() => StartNegotiationWithVendor(vendor)}
                >
                  Contact Vendor
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Default Data
const DEFAULT_MY_VENDORS = [
  {
    username: "vendor1",
    email: "vednor1@gmail.com",
    businessType: "Photographer",
  },
  {
    username: "vendor2",
    email: "vendor2@gmail.com",
    businessType: "Caterer",
  },
];

const DEFAULT_NEGOTIATED_VENDORS = [
  {
    username: "vendor3",
    email: "vendor3@gmail.com",
    businessType: "Florist",
  },
  {
    username: "vendor4",
    email: "vendor4@gmail.com",
    businessType: "Baker",
  },
  {
    username: "vendor5",
    email: "vendor5@gmail.com",
    businessType: "Musician",
  },
];

const DEFAULT_SUGGESTED_VENDORS = [
  {
    username: "vendor6",
    email: "vendor6@gmail.com",
    businessType: "Decorator",
  },
  {
    username: "vendor7",
    email: "vendor7@gmail.com",
    businessType: "Hair Stylist",
  },
  {
    username: "vendor8",
    email: "vendor8@gmail.com",
    businessType: "Makeup Artist",
  },
  {
    username: "vendor9",
    email: "vendor9@gmail.com",
    businessType: "Videographer",
  },
  {
    username: "vendor10",
    email: "vendor10@gmail.com",
    businessType: "Transportation",
  },
];

export default EventVendors;
