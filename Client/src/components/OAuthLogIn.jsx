import { Button, Spinner } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase.js";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Toaster, toast } from "react-hot-toast";
import { useState } from "react";

import axios from "../api/axios.js";
const GOOGLE_LOGIN_URL = "http://localhost:4000/google/login";

import useAuth from "../hooks/useAuth.js";
import { jwtDecode } from "jwt-decode";

function OAuthLogin() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const auth = getAuth(app); //google auth
  const { setAuth } = useAuth(); //axios auth -- context

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

      //console.log(JSON.stringify(res?.data));
      toast.success("Logged in successfully");
      const accessToken = res?.data?.accessToken;
      const role = jwtDecode(accessToken).userInfo.role;
      const user = jwtDecode(accessToken).userInfo.id;
      localStorage.setItem("userName", res?.data?.userName);
      localStorage.setItem("email", res?.data?.email);
      setAuth({ user, role, accessToken });
      // navigate to the previous page or home page
      navigate(from, { replace: true });
    } catch (error) {
      setLoading(false);

      if (!error?.response) toast.error("Error: No response from server.");
      else toast.error("Error: " + error.message);
      console.error(error.data);
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
