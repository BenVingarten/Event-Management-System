import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster, toast } from "react-hot-toast";

import axios from "../api/axios";
const GOOGLE_SIGNUP_URL = "http://localhost:4000/google/register";

function OAuthSignUp({
  role,
  businessInfo,
  businessLocation,
  businessEventTypes,
}) {
  const navigate = useNavigate();

  const auth = getAuth(app);
  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      const userInfo = {
        username: resultsFromGoogle.user.displayName,
        email: resultsFromGoogle.user.email,
        role: role,
      };
      if (role === "Vendor") {
        userInfo.businessName = businessInfo.businessName;
        userInfo.businessType = businessInfo.businessType;
        userInfo.businessLocation = businessLocation;
        userInfo.eventTypes = businessEventTypes;
        userInfo.businessDescription = businessInfo.businessDescription;
      }

      const response = await axios.post(
        GOOGLE_SIGNUP_URL,
        JSON.stringify({
          ...userInfo,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(JSON.stringify(response));
      toast.success("Register successful");
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.message);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={true} />

      <Button
        type="button"
        gradientDuoTone="pinkToOrange"
        outline
        onClick={handleGoogleClick}
        className="w-full"
      >
        <AiFillGoogleCircle className="w-6 h-6 mr-2" />
        Continue with Google
      </Button>
    </>
  );
}

export default OAuthSignUp;

OAuthSignUp.propTypes = {
  role: PropTypes.string,
  businessInfo: PropTypes.object,
  businessLocation: PropTypes.array,
  businessEventTypes: PropTypes.array,
};
