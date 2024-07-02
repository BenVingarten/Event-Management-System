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
    businessName: "",
    email: "",
    businessType: "",
    price: 0,
  });

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

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
        setEventVendors(res.data.addedVendors);
        setNegotiatedVendors(res.data.negotiatedVendors);
        setSuggestedVendors(res.data.suggestedVendors);

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
    };
  }, []);

  const StartNegotiationWithVendor = async (vendor) => {
    toast.loading(
      "It might take a few seconds to send the email to the vendor...",
      {
        duration: 1500,
      }
    );
    try {
      const res = await axiosPrivate.post(
        `users/${userId}/events/${eventID}/vendors/${vendor.vendorId}`
      );
      console.log(res.data);
      toast.success("Email Sent to Vendor!");
      console.log(vendor);
      // Add to Negotiated Vendors
      setNegotiatedVendors((pv) => [...pv, vendor]);
      // Remove from Suggested Vendors
      setSuggestedVendors((pv) =>
        pv.filter((v) => v.businessName !== vendor.businessName)
      );
      // Send Email
    } catch (err) {
      console.log(err.response.data.err);
      toast.error("Failed to Send Email to Vendor!");
    }
  };

  const AddVendorToMyVendors = async (vendor) => {
    try {
      console.log(vendor);
      const res = await axiosPrivate.patch(
        `users/${userId}/events/${eventID}/vendors/${vendor.vendorId}`,
        { priceForService: vendor.price }
      );
      console.log(res.data);
      toast.success("Vendor Added to Event Vendors!");
      console.log(vendor);
      setEventVendors((pv) => [...pv, vendor]);
      setNegotiatedVendors((pv) =>
        pv.filter((v) => v.businessName !== vendor.businessName)
      );
    } catch (err) {
      console.log(err.response.data);
      toast.error("Failed to Add Vendor to Event Vendors!");
    }
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

  const handleAddVendorToMyVendors = () => {
    if (selectedVendor) {
      AddVendorToMyVendors(selectedVendor);
      setPriceModalOpen(false);
      setSelectedVendor(null);
    }
  };

  return (
    <div className="grid sm:grid-rows-3 md:grid-cols-3 pl-5">
      <Toaster />
      {/* Event Vendors */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Event Vendors</h1>
        {eventVendors.map((vendor) => (
          <Card key={vendor.businessName} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.businessName}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
                {vendor.leadCount && <p>Leads: {vendor.leadCount}</p>}
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

            <TextInput
              id="price"
              type="number"
              className="p-2"
              placeholder="Vendor Price"
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
          <Card key={vendor.businessName} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.businessName}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
                {vendor.leadCount && <p>Leads: {vendor.leadCount}</p>}
              </div>
              <div className="flex justify-end items-center h-full">
                <Button
                  outline
                  gradientDuoTone="greenToBlue"
                  className="mr-2"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setPriceModalOpen(true);
                  }}
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

      <Modal show={priceModalOpen} onClose={() => setPriceModalOpen(false)}>
        <form className="p-5" onSubmit={(e) => e.preventDefault()}>
          <h1 className="text-2xl font-bold mb-2">Add Price for Vendor</h1>
          <TextInput
            id="price"
            type="number"
            className="p-2"
            placeholder="Vendor Price"
            onChange={(e) =>
              setSelectedVendor((prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
            required
          />
          <Button
            color={"green"}
            className="m-2"
            type="button"
            onClick={handleAddVendorToMyVendors}
          >
            Add Vendor
          </Button>
          <Button
            color={"red"}
            className="m-2"
            onClick={() => setPriceModalOpen(false)}
          >
            Cancel
          </Button>
        </form>
      </Modal>

      {/* Suggested Vendors */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 ">Suggested Vendors</h1>

        {suggestedVendors.map((vendor) => (
          <Card key={vendor.businessName} className="mb-4 mr-5">
            <div className="grid grid-cols-2">
              <div className="sm:overflow-x-scroll md:overflow-auto">
                <p className="text-lg font-bold">{vendor.businessName}</p>
                <p>{vendor.email}</p>
                <p>{vendor.businessType}</p>
                {vendor.leadCount && <p>Leads: {vendor.leadCount}</p>}
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

export default EventVendors;
