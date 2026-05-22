import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";


const Order = () => {
  const { user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculate prices if not in cart state
  const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 50000 ? 0 : 2000;
  const totalPrice = itemsPrice + shippingPrice;

  const placeOrderHandler = async () => {
    if (!user) {
      toast.error("PLEASE LOGIN FIRST");
      navigate("/login");
      return;
    }

    if (cart.cartItems.length === 0) {
      toast.error("YOUR CART IS EMPTY");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
      };

      const orderData = {
        orderItems: cart.cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: cart.shippingAddress || { address: "N/A", city: "N/A", postalCode: "N/A", country: "Nigeria" },
        paymentMethod: "Cash on Delivery",
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
      };

      const { data } = await axios.post("http://localhost:4000/api/orders", orderData, config);
      
      // Clear cart after successful order
      dispatch({ type: CLEAR_CART });
      localStorage.removeItem('cartItems');
      
      toast.success("ORDER PLACED SUCCESSFULLY 🔥");
      setLoading(false);
      navigate(`/order/${data._id}`);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "ORDER FAILED");
    }
  };

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "2rem", letterSpacing: "2px" }}>
          CHECKOUT
        </h1>

        {cart.cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>YOUR CART IS EMPTY.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            
            {/* ORDER ITEMS */}
            <div style={{ background: "#111", padding: "2rem", border: "1px solid #333", borderRadius: "8px" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>ORDER ITEMS</h2>
              {cart.cartItems.map((item) => (
                <div key={item._id} style={{ 
                  display: "flex", 
                  gap: "1rem", 
                  marginBottom: "1.5rem", 
                  paddingBottom: "1.5rem",
                  borderBottom: "1px solid #333"
                }}>
                  <img src={`http://localhost:4000${item.image}`} alt={item.name} style={{ width: "80px", height: "100px", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "700", marginBottom: "0.5rem" }}>{item.name}</p>
                    <p style={{ color: "#999" }}>Qty: {item.qty} × ₦{item.price.toLocaleString()}</p>
                  </div>
                  <p style={{ fontWeight: "900" }}>₦{(item.qty * item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div style={{ background: "#111", padding: "2rem", border: "1px solid #333", borderRadius: "8px", height: "fit-content" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>ORDER SUMMARY</h2>
              
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                <p>Items</p>
                <p>₦{itemsPrice.toLocaleString()}</p>
              </div>
              
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                <p>Shipping</p>
                <p>₦{shippingPrice.toLocaleString()}</p>
              </div>
              
              <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", borderTop: "1px solid #333", paddingTop: "1rem" }}>
                <p style={{ fontSize: "1.25rem", fontWeight: "900" }}>TOTAL</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "900" }}>₦{totalPrice.toLocaleString()}</p>
              </div>

              <button 
                onClick={placeOrderHandler}
                disabled={loading}
                style={{
                  background: loading ? "#333" : "#FF0000",
                  color: "#fff",
                  padding: "1rem",
                  border: "none",
                  fontWeight: "900",
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  letterSpacing: "1px",
                  fontSize: "1rem"
                }}
              >
                {loading ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Order;