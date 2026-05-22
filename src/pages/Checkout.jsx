import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { clearCart } from "../redux/cartSlice";
import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

function Checkout() {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = (cartItems || []).reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!form.fullName ||!form.address ||!form.city ||!form.phone) {
      toast.error("PLEASE FILL ALL SHIPPING FIELDS", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
      return;
    }

    if (!user ||!user._id) {
      toast.error("PLEASE LOGIN FIRST", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    for (let item of cartItems) {
      if (!isValidObjectId(item._id)) {
        toast.error("INVALID PRODUCT ID IN CART. CLEAR CART AND ADD AGAIN", {
          style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
        });
        console.error('Bad ID:', item._id);
        return;
      }
    }

    setLoading(true);
    try {
      const token = user.token;

      await API.post("/orders", {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: {
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          phone: form.phone
        },
        totalPrice: totalPrice,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(clearCart());
      toast.success("ORDER PLACED SUCCESSFULLY", {
        style: { background: '#111', color: '#fff', border: '1px solid #FF0000', fontWeight: '700', letterSpacing: '1px' }
      });
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "ORDER FAILED. TRY AGAIN", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ background: "#0a", color: "#fff", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>YOUR CART IS EMPTY</p>
          <Link to="/shop" style={{
            background: "#FF0000",
            color: "#fff",
            padding: "1rem 2rem",
            textDecoration: "none",
            fontWeight: "700",
            letterSpacing: "1px"
          }}>
            CONTINUE SHOPPING
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "4rem 2rem" }}>

        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "0.5rem" }}>
            CHECKOUT
          </h1>
          <div style={{ width: "40px", height: "3px", background: "#FF0000" }}></div>
        </div>

        <form onSubmit={handleCheckout} style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "4rem",
          alignItems: "start"
        }} className="checkout-layout">

          <div>
            <h2 style={{
              fontSize: "1rem",
              fontWeight: "700",
              letterSpacing: "1.5px",
              marginBottom: "2rem"
            }}>
              SHIPPING INFO
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { label: "Full Name", key: "fullName", type: "text" },
                { label: "Address", key: "address", type: "text" },
                { label: "City", key: "city", type: "text" },
                { label: "Phone Number", key: "phone", type: "tel" }
              ].map(field => (
                <input
                  key={field.key}
                  type={field.type}
                  placeholder={field.label}
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  required
                  style={{
                    background: "#111",
                    border: "1px solid #222",
                    color: "#fff",
                    padding: "1rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    width: "100%",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid #FF0000"}
                  onBlur={(e) => e.target.style.border = "1px solid #222"}
                />
              ))}
            </div>
          </div>

          <div style={{ background: "#111", padding: "2rem", position: "sticky", top: "2rem" }}>
            <h2 style={{
              fontSize: "1rem",
              fontWeight: "700",
              letterSpacing: "1.5px",
              marginBottom: "2rem"
            }}>
              ORDER SUMMARY
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
              {cartItems.map((item, index) => (
                <div key={item._id || `cart-item-${index}`} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "#999",
                  lineHeight: "1.4"
                }}>
                  <span style={{ paddingRight: "1rem" }}>{item.name} x {item.qty}</span>
                  <span style={{ whiteSpace: "nowrap" }}>₦{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid #222",
              paddingTop: "1rem",
              marginTop: "1rem",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.1rem",
              fontWeight: "700"
            }}>
              <span>TOTAL</span>
              <span>₦{totalPrice.toLocaleString()}</span>
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
                cursor: loading? "not-allowed" : "pointer",
                opacity: loading? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if(!loading) e.target.style.background = "#cc0000"
              }}
              onMouseLeave={(e) => {
                if(!loading) e.target.style.background = "#FF0000"
              }}
            >
              {loading? <ClipLoader color="#fff" size={20} /> : null}
              {loading? "PLACING ORDER..." : `PLACE ORDER - ₦${totalPrice.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;