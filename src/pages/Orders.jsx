import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

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
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "80vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <ClipLoader color="#FF0000" size={50} />
        <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>LOADING ORDERS...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "900", 
          marginBottom: "2rem",
          letterSpacing: "2px"
        }}>
          MY ORDERS
        </h1>

        {orders.length === 0 ? (
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
        ) : (
          orders.map((order) => (
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
                  <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{order._id}</p>
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
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;