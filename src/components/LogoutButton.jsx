import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser()); // Clears Redux + localStorage
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="btn-white">
      LOGOUT
    </button>
  );
};

export default LogoutButton;