import { jwtDecode } from "jwt-decode";
import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  try {
    const refresh = async () => {
      const response = await axios.get("/refresh", {
        withCredentials: true,
      });
      const accessToken = response.data?.accessToken;
      setAuth((prev) => {
        return {
          ...prev,
          role: jwtDecode(accessToken).userInfo.role,
          user: jwtDecode(accessToken).userInfo.id,
          accessToken: accessToken,
        };
      });
      return response.data.accessToken;
    };
    return refresh;
  } catch (error) {
    console.error("Error: " + error.message);
  }
};

export default useRefreshToken;
