import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart, updateQty } from "../redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { user } = useSelector((state) => state.auth);
  
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRemove = (id) => {
    setConfirmAction({
      text: "Remove this item from cart?",
      onConfirm: () => {
        dispatch(removeFromCart(id));
        toast.success("ITEM REMOVED");
        setConfirmAction(null);
      }
    });
  };

  const handleClearCart = () => {
    setConfirmAction({
      text: "Clear your entire cart?",
      onConfirm: () => {
        dispatch(clearCart());
        toast.success("CART CLEARED");
        setConfirmAction(null);
      }
    });
  };

  const handleUpdateQty = (id, qty) => {
    if (qty < 1) return;
    dispatch(updateQty({ id, qty: Number(qty) }));
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("PLEASE LOGIN TO CHECKOUT");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setLoading(true);
    setTimeout(() => navigate("/checkout"), 300);
  };

  const total = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return acc + price * qty;
  }, 0);

  const safeTotal = Number.isNaN(total) ? 0 : total;

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "4rem 2rem" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "0.5rem" }}>
            YOUR CART ({cartItems.length})
          </h1>
          <div style={{ width: "40px", height: "3px", background: "#FF0000" }}></div>
        </div>

        {confirmAction && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', zIndex: 9999
          }}>
            <div style={{
              background: '#111', border: '2px solid #fff', padding: '30px',
              maxWidth: '400px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '25px', textTransform: 'uppercase' }}>
                {confirmAction.text}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={confirmAction.onConfirm} style={{
                  background: '#fff', color: '#000', border: 'none', padding: '12px 30px', 
                  fontWeight: '900', cursor: 'pointer'
                }}>
                  YES
                </button>
                <button onClick={() => setConfirmAction(null)} style={{
                  background: 'transparent', color: '#fff', border: '2px solid #fff', 
                  padding: '12px 30px', fontWeight: '900', cursor: 'pointer'
                }}>
                  NO
                </button>
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>Your cart is empty</p>
            <Link to="/shop" style={{
              background: "#FF0000", color: "#fff", padding: "1rem 2rem",
              textDecoration: "none", fontWeight: "700", letterSpacing: "1px"
            }}>
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "4rem", alignItems: "start" }}>
            
            <div>
              <div style={{
                display: "grid", gridTemplateColumns: "3fr 1fr 1fr",
                paddingBottom: "1rem", borderBottom: "1px solid #222", marginBottom: "2rem"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1.5px", color: "#666" }}>PRODUCT</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1.5px", color: "#666", textAlign: "center" }}>QUANTITY</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1.5px", color: "#666", textAlign: "right" }}>TOTAL</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {cartItems.map((item) => {
                  const price = Number(item.price) || 0;
                  const qty = Number(item.qty) || 0;
                const stock = Number(item.stock ?? item.countInStock ?? 0);
                  const itemTotal = price * qty;
                  const safeItemTotal = Number.isNaN(itemTotal) ? 0 : itemTotal;
                  
                  return (
                    <div key={item._id} style={{
                      display: "grid", gridTemplateColumns: "3fr 1fr 1fr",
                      alignItems: "center", gap: "1rem"
                    }}>
                      
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <img src={item.image} alt={item.name} style={{ width: "80px", height: "100px", objectFit: "cover", background: "#111" }} />
                        <div>
                          <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                            <Link to={`/product/${item._id}`} style={{ color: "#fff", textDecoration: "none" }}>
                              {item.name}
                            </Link>
                          </h3>
                          <p style={{ fontSize: "0.85rem", color: "#999" }}>₦{price.toLocaleString()}</p>
                          <p style={{ fontSize: "0.7rem", color: "#666" }}>{stock} in stock</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                        <button 
                          onClick={() => handleUpdateQty(item._id, qty - 1)}
                          disabled={qty <= 1}
                          style={{
                            background: "transparent", border: "none", color: "#fff",
                            fontSize: "1.5rem", cursor: qty <= 1 ? "not-allowed" : "pointer",
                            padding: "0 0.5rem"
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "1rem", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>
                          {qty}
                        </span>
                        <button 
                          onClick={() => handleUpdateQty(item._id, qty + 1)}
                          disabled={qty >= stock}
                          style={{
                            background: "transparent", border: "none", color: "#fff",
                            fontSize: "1.5rem", cursor: qty >= stock ? "not-allowed" : "pointer",
                            padding: "0 0.5rem"
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                        <span style={{ fontSize: "1rem", fontWeight: "700" }}>
                          ₦{safeItemTotal.toLocaleString()}
                        </span>
                        <button onClick={() => handleRemove(item._id)} style={{
                          background: "transparent", border: "none", color: "#666",
                          cursor: "pointer", padding: "8px"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleClearCart} style={{
                background: "transparent", border: "none", color: "#FF0000",
                fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1px",
                cursor: "pointer", marginTop: "2rem"
              }}>
                CLEAR CART
              </button>
            </div>

            <div style={{ background: "#111", padding: "2rem", position: "sticky", top: "2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "2rem" }}>
                ORDER SUMMARY
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#999" }}>
                  <span>Subtotal</span>
                  <span>₦{safeTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#999" }}>
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div style={{
                borderTop: "1px solid #222", paddingTop: "1rem", marginBottom: "2rem",
                display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "700"
              }}>
                <span>TOTAL</span>
                <span>₦{safeTotal.toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout} disabled={loading} style={{
                width: "100%", background: "#FF0000", color: "#fff", border: "none",
                padding: "1.25rem", fontSize: "0.85rem", fontWeight: "700",
                letterSpacing: "1.5px", cursor: loading ? "not-allowed" : "pointer"
              }}>
                {loading ? <ClipLoader size={20} color="#fff" /> : "CHECKOUT"}
              </button>
              
              <Link to="/shop" style={{ display: "block", textAlign: "center", marginTop: "1rem", color: "#777", fontSize: "14px" }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;