import { Button, Spinner } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster, toast } from "react-hot-toast";
import { useContext, useState } from "react";

import axios from "../api/axios.js";
import AuthContext from "../context/AuthProvider.jsx";
const GOOGLE_LOGIN_URL = "http://localhost:4000/google/login";

function OAuthLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app); //google auth
  const { setAuth } = useContext(AuthContext); //axios auth -- context
  const handleGoogleClick = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const res = await axios.post(
        GOOGLE_LOGIN_URL,
        JSON.stringify({
          email: resultsFromGoogle.user.email,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(JSON.stringify(res?.data));
      toast.success("Logged in successfully");
      const accessToken = res?.data?.accessToken;
      const role = res?.data?.role;
      setAuth({ role, accessToken });
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.response.data.message);
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
        {loading ? (
          <>
            <Spinner size="sm" />
            <span className="pl-3">Loading...</span>
          </>
        ) : (
          <>
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            Continue with Google
          </>
        )}
      </Button>
    </>
  );
}

export default OAuthLogin;

OAuthLogin.propTypes = {
  isVendor: PropTypes.bool,
};
