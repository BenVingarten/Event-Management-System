import { Button } from "flowbite-react";
import Users from "../components/Users";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

function Admin() {
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();

  const getUsers = async () => {
    try {
      const response = await axiosPrivate.get("/users", {
        signal: controller.signal,
      });
      console.log(response.data.allUsers);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Admin Page</h2>
      <Users />
      <Button className="mt-5" variant="primary" onClick={getUsers}>
        Log Users
      </Button>
    </div>
  );
}

export default Admin;
