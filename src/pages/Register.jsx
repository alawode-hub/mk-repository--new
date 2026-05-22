import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, resetError, resetSuccess } from "../redux/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { Toaster, toast } from "react-hot-toast"; // ← NEW

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  useEffect(() => {
    if (error) {
      toast.error(error.toUpperCase()); // ← TOAST
      dispatch(resetError());
    }
    if (successMessage) {
      toast.success(successMessage.toUpperCase()); // ← TOAST
      dispatch(resetSuccess());
      setTimeout(() => navigate("/login"), 1500); // ← 1.5s
    }
  }, [error, successMessage, navigate, dispatch]);

  return (
    <div className="auth-page">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            fontWeight: '700',
            letterSpacing: '0.5px'
          },
          success: { 
            iconTheme: { primary: '#00ff00', secondary: '#000' },
            duration: 2000
          },
          error: { 
            iconTheme: { primary: '#ff0000', secondary: '#000' },
            duration: 3000
          },
        }}
      />

      <div className="auth-box">
        <h2>REGISTER</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
            />
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#777"
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button 
            type="submit" 
            className="btn-white" 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {loading ? (
              <>
                <ClipLoader size={18} color="#000" />
                CREATING ACCOUNT...
              </>
            ) : (
              "REGISTER"
            )}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;