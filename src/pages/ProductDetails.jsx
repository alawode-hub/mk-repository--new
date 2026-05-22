import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { addToCart } from "../redux/cartSlice";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/api/products/${id}`);

        // Normalize: use stock if countInStock is missing
        const normalizedData = {
         ...data,
          price: Number(data.price) || 0,
          countInStock: Number(data.stock?? data.countInStock?? 0)
        };

        setProduct(normalizedData);
        setLoading(false);
      } catch (error) {
        console.error("Product not found:", error);
        toast.error("PRODUCT NOT FOUND", {
          style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
        });
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("PLEASE LOGIN FIRST", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
      navigate("/login");
      return;
    }

    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image,
      category: product.category,
      description: product.description,
      countInStock: Number(product.countInStock) || 0,
      qty: Number(qty) || 1
    }));

    setAdded(true);
    toast.success("ADDED TO CART", {
      style: { background: '#111', color: '#fff', border: '1px solid #FF0000', fontWeight: '700', letterSpacing: '1px' }
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBack = () => {
    const category = location.state?.fromCategory || product?.category || "ALL PRODUCTS";
    navigate("/shop", { state: { activeCategory: category } });
  };

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
        <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>LOADING PRODUCT...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>PRODUCT NOT FOUND</p>
        <button
          onClick={() => navigate("/shop")}
          style={{
            background: "#FF0000",
            color: "#fff",
            padding: "1rem 2rem",
            border: "none",
            fontWeight: "700",
            letterSpacing: "1px",
            cursor: "pointer"
          }}
        >
          BACK TO SHOP
        </button>
      </div>
    </div>
  );

  const safePrice = Number(product.price) || 0;

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 2rem 0" }}>
        <button
          onClick={handleBack}
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: "#999",
            padding: "0.75rem 1.5rem",
            fontSize: "0.75rem",
            fontWeight: "600",
            letterSpacing: "1px",
            cursor: "pointer",
            marginBottom: "2rem",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#FF0000"
            e.target.style.color = "#fff"
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#333"
            e.target.style.color = "#999"
          }}
        >
          ← BACK TO {location.state?.fromCategory || product.category || "ALL PRODUCTS"}
        </button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "3rem",
          alignItems: "start"
        }} className="product-detail-layout">

          <div style={{
            background: "#111",
            maxHeight: "600px",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#111"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              letterSpacing: "1.5px",
              color: "#666",
              textTransform: "uppercase"
            }}>
              {product.category}
            </p>

            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              lineHeight: "1.1",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              {product.name.replace("MK Collectives ", "")}
            </h1>

            <div>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                ₦{safePrice.toLocaleString()}
              </p>
              <div style={{ width: "40px", height: "3px", background: "#FF0000" }}></div>
            </div>

            <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#999" }}>
              {product.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1px" }}>
                  QUANTITY
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", padding: "0 0.5rem" }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: "1rem", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(Number(product.countInStock), qty + 1))}
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", padding: "0 0.5rem" }}
                  >
                    +
                  </button>
                </div>
              </div>

              <span style={{ fontSize: "0.8rem", color: "#666" }}>
                {Number(product.countInStock)} available
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={added || Number(product.countInStock) === 0}
              style={{
                width: "100%",
                background: added? "#16a34a" : Number(product.countInStock) === 0? "#333" : "#FF0000",
                color: "#fff",
                border: "none",
                padding: "1.25rem",
                fontSize: "0.85rem",
                fontWeight: "700",
                letterSpacing: "1.5px",
                cursor: added || Number(product.countInStock) === 0? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={(e) => {
                if (!added && Number(product.countInStock) > 0) e.target.style.background = "#cc0000"
              }}
              onMouseLeave={(e) => {
                if (!added && Number(product.countInStock) > 0) e.target.style.background = "#FF0000"
              }}
            >
              {Number(product.countInStock) === 0? 'OUT OF STOCK' : added? 'ADDED TO CART ✓' : 'ADD TO CART'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;