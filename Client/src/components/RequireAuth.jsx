import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  return allowedRoles.includes(auth?.role) ? (
    <Outlet />
  ) : auth?.userName ? (
    <>
      <Navigate to="/unauthorized" state={{ from: location }} replace />
      {console.log("Unauthorized")}
    </>
  ) : (
    <>
      <Navigate to="/login" state={{ from: location }} replace />
      {console.log("Login required")}
    </>
  );
};

RequireAuth.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RequireAuth;
