import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

function Users() {
  const [users, setUsers] = useState();
  const axiosPrivate = useAxiosPrivate();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController(); // helps to cancel fetch requests

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get("http://localhost:4000/users", {
          signal: controller.signal,
        });
        if (isMounted) setUsers(response.data);
      } catch (error) {
        toast.error("Error: " + error.message);
        console.error(error);
        navigate("/unauthorized", { state: { from: location }, replace: true });
      }
    };

    getUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);
  return (
    <div>
      <Toaster />
      <h2>Users</h2>
      {users?.length ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
}

export default Users;
