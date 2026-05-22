import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/authSlice";
import { FaShoppingCart, FaBars, FaTimes, FaUser } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const handleShopClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (!user) {
      navigate('/login');
    } else {
      navigate('/shop');
    }
  };

  return (
    <>
      <nav style={{
        background: "#000",
        color: "#fff",
        height: "56px",
        minHeight: "56px",
        maxHeight: "56px",
        padding: "0 16px",
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #1a1a1a",
        boxSizing: "border-box",
        lineHeight: "1"
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "1"
          }}
        >
          <FaBars size={18} />
        </button>

        {/* CENTER: TEXT LOGO - NIKE/ZARA STYLE */}
        <Link
          to="/"
          onClick={closeMenu}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            height: "56px"
          }}
        >
          MK COLLECTIVES
        </Link>

        {/* RIGHT: Profile + Cart */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user && (
            <Link
              to="/profile"
              onClick={closeMenu}
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "1px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px",
                margin: 0,
                lineHeight: "1"
              }}
            >
              <FaUser size={14} />
              HI, {user.name?.split(" ")[0].toUpperCase()}
            </Link>
          )}

          <Link
            to="/cart"
            onClick={closeMenu}
            style={{
              color: "#fff",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              margin: 0,
              lineHeight: "1"
            }}
          >
            <FaShoppingCart size={18} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                background: "#FF0000",
                color: "#fff",
                borderRadius: "50%",
                minWidth: "16px",
                height: "16px",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                padding: "0 4px",
                lineHeight: "1"
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9998
          }}
        />
      )}

      {/* SLIDE DRAWER */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "280px",
        background: "#000",
        zIndex: 10000,
        transform: menuOpen? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        borderRight: "1px solid #1a1a1a"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px"
        }}>
          <button
            onClick={closeMenu}
            style={{
              background: "transparent",
              border: "2px solid #FF0000",
              color: "#fff",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              lineHeight: "1"
            }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div style={{
          padding: "0 32px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          marginTop: "16px"
        }}>
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "400",
              textTransform: "uppercase",
              lineHeight: "1"
            }}
          >
            HOME
          </Link>

          <Link
            to="/shop"
            onClick={handleShopClick}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "400",
              textTransform: "uppercase",
              lineHeight: "1"
            }}
          >
            SHOP
          </Link>

          {user? (
            <>
              <Link
                to="/profile"
                onClick={closeMenu}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "400",
                  textTransform: "uppercase",
                  lineHeight: "1"
                }}
              >
                PROFILE
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "400",
                    textTransform: "uppercase",
                    lineHeight: "1"
                  }}
                >
                  ADMIN
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FF0000",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: "400",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: "1"
                }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "400",
                  textTransform: "uppercase",
                  lineHeight: "1"
                }}
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "400",
                  textTransform: "uppercase",
                  lineHeight: "1"
                }}
              >
                REGISTER
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;