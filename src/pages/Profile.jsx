import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { updateUserProfile } from "../redux/authSlice";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import axios from "axios";

// ORDERS LIST COMPONENT 
const OrdersList = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get("http://localhost:4000/api/orders/myorders", config);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("FAILED TO LOAD ORDERS", {
          style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
        });
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (loading) return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "4rem",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <ClipLoader color="#FF0000" size={40} />
      <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>LOADING ORDERS...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ textAlign: "center", padding: "4rem 0" }}>
      <p style={{ color: "#666", marginBottom: "1rem" }}>YOU HAVE NO ORDERS YET.</p>
      <Link to="/shop" style={{
        background: "#FF0000",
        color: "#fff",
        padding: "0.75rem 1.5rem",
        textDecoration: "none",
        fontWeight: "700",
        letterSpacing: "1px"
      }}>
        START SHOPPING
      </Link>
    </div>
  );

  return (
    <>
      {orders.map((order) => (
        <div key={order._id} style={{ 
          border: "1px solid #333", 
          padding: "1.5rem", 
          marginBottom: "2rem",
          background: "#111"
        }}>
          {/* ORDER HEADER */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            marginBottom: "1.5rem", 
            borderBottom: "1px solid #333", 
            paddingBottom: "1rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.25rem" }}>ORDER ID</p>
              <p style={{ fontWeight: "600", fontSize: "0.9rem", wordBreak: "break-all" }}>{order._id}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.25rem" }}>DATE</p>
              <p style={{ fontWeight: "600" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.25rem" }}>STATUS</p>
              <p style={{ 
                fontWeight: "700", 
                color: order.isPaid ? "#16a34a" : "#FF0000",
                letterSpacing: "1px"
              }}>
                {order.isPaid ? "PAID" : "NOT PAID"}
              </p>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              letterSpacing: "1.5px",
              marginBottom: "1rem",
              color: "#999"
            }}>
              ITEMS ORDERED
            </p>
            {order.orderItems.map((item) => (
              <div key={item._id} style={{ 
                display: "flex", 
                gap: "1rem", 
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #222"
              }}>
                <img 
                  src={`http://localhost:4000${item.image}`} 
                  alt={item.name} 
                  style={{ 
                    width: "70px", 
                    height: "90px", 
                    objectFit: "cover",
                    background: "#0a0a0a"
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "600", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                    {item.name}
                  </p>
                  <p style={{ color: "#999", fontSize: "0.85rem" }}>
                    Qty: {item.qty} × ₦{item.price.toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "700" }}>
                    ₦{(item.qty * item.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER TOTAL */}
          <div style={{ 
            borderTop: "2px solid #333", 
            paddingTop: "1rem", 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>
              {order.orderItems.reduce((acc, item) => acc + item.qty, 0)} items
            </p>
            <p style={{ fontSize: "1.25rem", fontWeight: "900" }}>
              TOTAL: ₦{order.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

// MAIN PROFILE COMPONENT
const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // EYE TOGGLE STATES
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateUserProfile({ 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        email: formData.email 
      })).unwrap();
      
      toast.success("PROFILE UPDATED", {
        style: { background: '#111', color: '#fff', border: '1px solid #FF0000', fontWeight: '700', letterSpacing: '1px' }
      });
    } catch (error) {
      toast.error(error || "UPDATE FAILED", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("PASSWORDS DON'T MATCH", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
      return;
    }
    setLoading(true);
    try {
      // await dispatch(changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })).unwrap();
      toast.success("PASSWORD CHANGED", {
        style: { background: '#111', color: '#fff', border: '1px solid #FF0000', fontWeight: '700', letterSpacing: '1px' }
      });
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error || "PASSWORD CHANGE FAILED", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const EyeIcon = ({ show }) => (
    show ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  );

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        
        {/* HEADER */}
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "900",
          marginBottom: "0.5rem",
          letterSpacing: "2px"
        }}>
          HI, {user.name?.toUpperCase()}
        </h1>
        <div style={{
          width: "40px",
          height: "3px",
          background: "#FF0000",
          marginBottom: "2.5rem"
        }}></div>

        {/* TABS */}
        <div style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "3rem",
          borderBottom: "1px solid #222"
        }}>
          {["details", "orders", "password"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent",
                border: "none",
                color: activeTab === tab ? "#fff" : "#666",
                fontSize: "0.75rem",
                fontWeight: "700",
                letterSpacing: "1.5px",
                cursor: "pointer",
                paddingBottom: "1rem",
                borderBottom: activeTab === tab ? "2px solid #FF0000" : "2px solid transparent",
                textTransform: "uppercase"
              }}
            >
              {tab === "details" ? "Profile Details" : tab === "orders" ? "My Orders" : "Change Password"}
            </button>
          ))}
        </div>

        {/* PROFILE DETAILS TAB */}
        {activeTab === "details" && (
          <div style={{ maxWidth: "600px" }}>
            <form onSubmit={handleUpdateDetails}>
              
              {/* FIRST NAME */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  FIRST NAME
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "1rem",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* LAST NAME */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  LAST NAME
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "1rem",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "1rem",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#FF0000",
                  color: "#fff",
                  border: "none",
                  padding: "1.25rem",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem"
                }}
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : "UPDATE PROFILE"}
              </button>
            </form>
          </div>
        )}

        {/* ORDERS TAB - NOW WORKING */}
        {activeTab === "orders" && (
          <div style={{ maxWidth: "1000px" }}>
            <OrdersList user={user} />
          </div>
        )}

        {/* PASSWORD TAB WITH EYE ICONS */}
        {activeTab === "password" && (
          <div style={{ maxWidth: "600px" }}>
            <form onSubmit={handleChangePassword}>
              
              {/* CURRENT PASSWORD */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  CURRENT PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      background: "#111",
                      border: "1px solid #333",
                      color: "#fff",
                      padding: "1rem 2.5rem 1rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#FF0000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <EyeIcon show={showCurrentPassword} />
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  NEW PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      background: "#111",
                      border: "1px solid #333",
                      color: "#fff",
                      padding: "1rem 2.5rem 1rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#FF0000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <EyeIcon show={showNewPassword} />
                  </button>
                </div>
              </div>

              {/* CONFIRM NEW PASSWORD */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "0.5rem",
                  color: "#999"
                }}>
                  CONFIRM NEW PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      background: "#111",
                      border: "1px solid #333",
                      color: "#fff",
                      padding: "1rem 2.5rem 1rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#FF0000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#FF0000",
                  color: "#fff",
                  border: "none",
                  padding: "1.25rem",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem"
                }}
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : "CHANGE PASSWORD"}
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;