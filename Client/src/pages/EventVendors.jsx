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
    priceForService: 0,
  });

  const [priceForServiceModalOpen, setpriceForServiceModalOpen] =
    useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StartNegotiationWithVendor = async (vendor) => {
    toast.loading(
      "It might take a few seconds to send the email to the vendor...",
      {
        duration: 1500,
      }
    );
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axiosPrivate.post(
        `users/${userId}/events/${eventID}/vendors/${vendor._id}`
      );

      toast.success("Email Sent to Vendor!");

      // Add to Negotiated Vendors
      setNegotiatedVendors((pv) => [...pv, vendor]);
      // Remove from Suggested Vendors
      setSuggestedVendors((pv) =>
        pv.filter((v) => v.businessName !== vendor.businessName)
      );
      // Send Email
    } catch (err) {
      console.log(err.response.data.error);
      toast.error(err.response.data.error);
    }
  };

  const AddVendorToMyVendors = async (vendor) => {
    try {
      console.log(vendor);
      // eslint-disable-next-line no-unused-vars
      const res = await axiosPrivate.patch(
        `users/${userId}/events/${eventID}/vendors/${vendor._id}`,
        { priceForService: vendor.priceForService }
      );

      toast.success("Vendor Added to Event Vendors!");

      setEventVendors((pv) => [...pv, vendor]);
      setNegotiatedVendors((pv) =>
        pv.filter((v) => v.businessName !== vendor.businessName)
      );
    } catch (err) {
      console.error(err);
      console.log(err.response.data.error[0].msg);
      toast.error(err.response.data.error[0].msg);
    }
  };

  const RemoveVendorFromNegotiatedVendors = async (vendor) => {
    try {
      // eslint-disable-next-line no-unused-vars
      vendor.status = "Negotiated"
      const res = await axiosPrivate.delete(
        `users/${userId}/events/${eventID}/vendors`,
        { data: { vendor } }
      );

      toast.success("Vendor Removed from Event Vendors!");

      // Remove from Negotiated Vendors
      setNegotiatedVendors((pv) =>
        pv.filter((v) => v.username !== vendor.username)
      );
    } catch (err) {
      console.log(err.response.data);
      toast.error("Failed to Remove Vendor from Event Vendors!");
    }
  };

  const RemoveVendorFromEventVendors = async (vendor) => {
    try {
      // eslint-disable-next-line no-unused-vars
      vendor.status = "Added"
      const res = await axiosPrivate.delete(
        `users/${userId}/events/${eventID}/vendors`,
        { data: { vendor } }
      );

      toast.success("Vendor Removed from Event Vendors!");

      // Remove from Event Vendors
      setEventVendors((pv) =>
        pv.filter((v) => v.businessName !== vendor.businessName)
      );
    } catch (err) {
      console.log(err.response.data);
      toast.error("Failed to Remove Vendor from Event Vendors!");
    }
  };

  const AddVendorManually = async (e) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axiosPrivate.post(
        `users/${userId}/events/${eventID}/vendors`,
        newVendor
      );

      toast.success("Vendor Added Manually!");

      // Add to Event Vendors
      setEventVendors((pv) => [...pv, newVendor]);
      setNewVendor({
        businessName: "",
        email: "",
        businessType: "",
        priceForService: 0,
      });
      // Close Modal
      setModalOpen(false);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.err);
    }
  };

  const handleInputChange = (e) => {
    setNewVendor({ ...newVendor, [e.target.id]: e.target.value });
  };

  const handleAddVendorToMyVendors = () => {
    if (selectedVendor) {
      AddVendorToMyVendors(selectedVendor);
      setpriceForServiceModalOpen(false);
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
                <p>Type: {vendor.businessType}</p>
                <p>Price: {vendor.priceForService}</p>
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
      </div>

      {/* Add Vendor Manually */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="p-5 " onSubmit={AddVendorManually}>
          <h1 className="text-2xl font-bold mb-2">Add Vendor Manually</h1>
          <TextInput
            id="businessName"
            type="text"
            className="p-2"
            placeholder="Business Name"
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
            id="priceForService"
            type="number"
            className="p-2"
            placeholder="Vendor Price for Service"
            onChange={handleInputChange}
            required
          />

          <Button color={"green"} className="m-2" type="submit">
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
                    setpriceForServiceModalOpen(true);
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

      {/* Add Vendor priceForService Modal */}
      <Modal
        show={priceForServiceModalOpen}
        onClose={() => setpriceForServiceModalOpen(false)}
      >
        <form className="p-5" onSubmit={(e) => e.preventDefault()}>
          <h1 className="text-2xl font-bold mb-2">
            Add priceForService for Vendor
          </h1>
          <TextInput
            id="priceForService"
            type="number"
            className="p-2"
            placeholder="Vendor priceForService"
            onChange={(e) =>
              setSelectedVendor((prev) => ({
                ...prev,
                priceForService: e.target.value,
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
            onClick={() => setpriceForServiceModalOpen(false)}
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
