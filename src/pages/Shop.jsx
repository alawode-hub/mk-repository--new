import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { addToCart } from "../redux/cartSlice";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

function Shop() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get("category");

  const [activeCategory, setActiveCategory] = useState("ALL PRODUCTS");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const categories = ["ALL PRODUCTS", "TOPS", "JEANS", "CAPS", "SNEAKERS", "HOODIES", "SHORTJEANS"];

  // Sync URL + state on mount and when URL changes
  useEffect(() => {
    if (location.state?.activeCategory) {
      setActiveCategory(location.state.activeCategory);
    } else if (categoryFromUrl) {
      const formatted = categoryFromUrl.toUpperCase().replace(/\s+/g, "");
      setActiveCategory(formatted);
    } else {
      setActiveCategory("ALL PRODUCTS");
    }
  }, [categoryFromUrl, location.state]);

  // Update URL when category changes
  useEffect(() => {
    if (activeCategory === "ALL PRODUCTS") {
      navigate("/shop", { replace: true });
    } else {
      navigate(`/shop?category=${activeCategory}`, { replace: true });
    }
  }, [activeCategory, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/products");
        
        // Normalize stock fields so everything uses countInStock
        const normalized = data.map(p => ({
          ...p,
          countInStock: Number(p.stock ?? p.countInStock ?? 0)
        }));
        
        setProducts(normalized);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("FAILED TO LOAD PRODUCTS", {
          style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
        });
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (activeCategory === "ALL PRODUCTS") return true;
    const productCat = product.category?.toUpperCase().replace(/\s+/g, "");
    return productCat === activeCategory;
  });

  const [addedItems, setAddedItems] = useState({})

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("PLEASE LOGIN FIRST", {
        style: { background: '#FF0000', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
      });
      navigate("/login");
      return;
    }

    const cartProduct = {
      _id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image,
      category: product.category,
      description: product.description,
      countInStock: Number(product.countInStock) || 0,
      qty: 1
    };

    dispatch(addToCart(cartProduct));

    setAddedItems(prev => ({...prev, [product._id]: true }))
    toast.success("ADDED TO CART", {
      style: { background: '#111', color: '#fff', border: '1px solid #FF0000', fontWeight: '700', letterSpacing: '1px' }
    });
    setTimeout(() => {
      setAddedItems(prev => ({...prev, [product._id]: false }))
    }, 1500)
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
        <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>LOADING PRODUCTS...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "900",
          textAlign: "center",
          marginBottom: "0.5rem",
          letterSpacing: "2px"
        }}>
          THE COLLECTION
        </h1>
        <div style={{
          width: "40px",
          height: "3px",
          background: "#FF0000",
          margin: "0 auto 2.5rem auto"
        }}></div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          marginBottom: "3rem",
          flexWrap: "wrap"
        }} className="filter-tabs">
          {categories.map(cat => (
            <CategoryTab
              key={cat}
              cat={cat}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          ))}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2rem"
        }} className="product-grid">
          {filteredProducts.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666" }}>NO PRODUCTS IN THIS CATEGORY YET.</p>
          ) : (
            filteredProducts.map(product => (
              <ProductCardReplit
                key={product._id}
                product={product}
                handleAddToCart={handleAddToCart}
                addedItems={addedItems}
                activeCategory={activeCategory}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

const CategoryTab = ({ cat, activeCategory, setActiveCategory }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = activeCategory === cat;

  return (
    <button
      onClick={() => setActiveCategory(cat)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "transparent",
        border: "none",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: "700",
        letterSpacing: "1.5px",
        cursor: "pointer",
        paddingBottom: "6px",
        borderBottom: isActive || isHovered ? "2px solid #FF0000" : "2px solid transparent",
        transition: "all 0.2s"
      }}
    >
      {cat}
    </button>
  );
};

const ProductCardReplit = ({ product, handleAddToCart, addedItems, activeCategory }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <div style={{
        position: "relative",
        background: "#111",
        overflow: "hidden",
        aspectRatio: "3/4"
      }}>
        <Link to={`/product/${product._id}`} state={{ fromCategory: activeCategory }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)"
            }}
          />
        </Link>

        <div
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(product);
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: addedItems[product._id] ? "#16a34a" : "#FF0000",
            color: "#fff",
            padding: "1rem",
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: "700",
            letterSpacing: "1.5px",
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s ease",
            zIndex: 2
          }}
        >
          {addedItems[product._id] ? 'ADDED ✓' : 'ADD TO CART'}
        </div>
      </div>

      <div style={{ padding: "1rem 0" }}>
        <Link to={`/product/${product._id}`} state={{ fromCategory: activeCategory }} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            marginBottom: "0.25rem",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: "1.4"
          }}>
            {product.name}
          </h3>
        </Link>
        <p style={{
          fontSize: "0.8rem",
          fontWeight: "700",
          color: "#999"
        }}>
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Shop;