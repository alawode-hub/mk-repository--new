import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";
import { Truck, Scissors, Tag } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/products");
        
        const selectedProducts = [
  data.find(p => p.name.toLowerCase().includes("splatter")), // fixed
  data.find(p => p.name.includes("Timberland 6")),
  data.find(p => p.name.includes("Essentials Hoodie")),
  data.find(p => p.name.includes("Fitted Cap - Black"))
].filter(Boolean);
        setFeaturedProducts(selectedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("FAILED TO LOAD PRODUCTS", {
          style: { background: '#1a1a1a', color: '#fff', fontWeight: '700', letterSpacing: '1px' }
        });
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleShopClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/shop');
    }
  };

  const buttonHover = {
    onMouseEnter: (e) => {
      e.target.style.background = "#e0e0e0";
    },
    onMouseLeave: (e) => {
      e.target.style.background = "#fff";
    }
  };

  const outlineHover = {
    onMouseEnter: (e) => {
      e.target.style.background = "#1a1a1a";
      e.target.style.borderColor = "#666";
    },
    onMouseLeave: (e) => {
      e.target.style.background = "transparent";
      e.target.style.borderColor = "#fff";
    }
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <Toaster position="top-center" duration={2500} />
      
      {/* HERO SECTION */}
      <section 
        style={{ 
          backgroundImage: "url('http://localhost:4000/media/bg-street.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 5%",
          backgroundColor: "#000",
          textAlign: "center",
          position: "relative"
        }}
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)"
        }} />
        
        <div style={{ maxWidth: "700px", position: "relative", zIndex: 1 }}>
          <h1 style={{ 
            fontSize: "52px", 
            fontWeight: "900", 
            lineHeight: "1.2", 
            marginBottom: "1.5rem", 
            textTransform: "uppercase" 
          }}>
            ELEVATE YOUR <br />
            <span style={{ color: "#FF0000" }}>STREETWEAR STYLE</span>
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#ccc", 
            marginBottom: "2.5rem", 
            lineHeight: "1.6",
            maxWidth: "550px",
            margin: "0 auto 2.5rem auto"
          }}>
            CONFIDENT, REBELLIOUS, WITH A TOUCH OF LUXURY. FOR THE CITY KID WHO TREATS FITS LIKE A CRAFT.
          </p>
          <button 
            onClick={handleShopClick}
            style={{
              background: "#fff",
              color: "#000",
              padding: "1rem 3rem",
              border: "none",
              fontWeight: "700",
              letterSpacing: "2px",
              cursor: "pointer",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              transition: "all 0.2s"
            }}
            {...buttonHover}
          >
            GET STARTED
          </button>
        </div>
      </section>

      {/* LATEST DROPS */}
      <section style={{ padding: "6rem 5%", background: "#0a0a0a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "3rem" 
          }}>
            <div>
              <h2 style={{ 
                fontSize: "38px", 
                fontWeight: "900", 
                marginBottom: "0.5rem", 
                textTransform: "uppercase",
                letterSpacing: "2px"
              }}>
                LATEST DROPS
              </h2>
              <p style={{ color: "#888", fontSize: "0.95rem", letterSpacing: "1.5px" }}>
                Curated fits for the season
              </p>
            </div>
            <button 
              onClick={handleShopClick}
              style={{ 
                background: "transparent", 
                color: "#fff", 
                border: "2px solid #fff",
                padding: "0.9rem 2.2rem",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                transition: "all 0.2s"
              }}
              {...outlineHover}
            >
              VIEW ALL
            </button>
          </div>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem", flexDirection: "column", gap: "1rem" }}>
              <ClipLoader color="#FF0000" size={40} />
              <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>LOADING PRODUCTS...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>NO FEATURED PRODUCTS FOUND</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: "2rem" 
            }}>
              {featuredProducts.map(product => (
                <Link 
                  to={`/product/${product._id}`} 
                  key={product._id} 
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ 
                    background: "#1a1a1a", 
                    border: "1px solid #2a2a2a", 
                    overflow: "hidden", 
                    transition: "all 0.3s ease", 
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    height: "400px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    
                    <div style={{ 
                      width: "100%", 
                      height: "280px", 
                      overflow: "hidden", 
                      background: "#000",
                      flexShrink: 0
                    }}>
                      <img 
                        src={`http://localhost:4000${product.image}`} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x400/1a1a/FF0000?text=MK";
                        }}
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover", 
                          objectPosition: "center"
                        }}
                      />
                    </div>

                    <div style={{ 
                      padding: "1.2rem 1.5rem", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between",
                      height: "120px",
                      boxSizing: "border-box"
                    }}>
                      <span style={{ 
                        fontSize: "0.88rem", 
                        color: "#fff", 
                        fontWeight: "500", 
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        letterSpacing: "0.5px"
                      }}>
                        {product.name}
                      </span>
                      <span style={{ 
                        fontSize: "1.15rem", 
                        fontWeight: "800", 
                        color: "#FF0000",
                        letterSpacing: "1px"
                      }}>
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "6rem 5%", background: "linear-gradient(180deg, #0a0a0a 0%, #000 100%)", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "38px", 
            fontWeight: "900", 
            marginBottom: "1rem", 
            textTransform: "uppercase",
            letterSpacing: "2px"
          }}>
            WHY CHOOSE US
          </h2>
          <div style={{ width: "60px", height: "4px", background: "#FF0000", margin: "0 auto 4rem auto", borderRadius: "2px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4rem" }}>
            
            <div>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "#FF0000", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 2rem auto"
              }}>
                <Truck size={36} color="#fff" strokeWidth={2} />
              </div>
              <h3 style={{ color: "white", fontSize: "1.25rem", letterSpacing: "2px", marginBottom: "1rem", fontWeight: "700", textTransform: "uppercase" }}>FAST DELIVERY</h3>
              <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: "1.7" }}>Express shipping worldwide. Get your fits when you need them.</p>
            </div>

            <div>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "#FF0000", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 2rem auto"
              }}>
                <Scissors size={36} color="#fff" strokeWidth={2} />
              </div>
              <h3 style={{ color: "white", fontSize: "1.25rem", letterSpacing: "2px", marginBottom: "1rem", fontWeight: "700", textTransform: "uppercase" }}>QUALITY STREETWEAR</h3>
              <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: "1.7" }}>Premium heavyweight fabrics. Built to last the streets.</p>
            </div>

            <div>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "#FF0000", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 2rem auto"
              }}>
                <Tag size={36} color="#fff" strokeWidth={2} />
              </div>
              <h3 style={{ color: "white", fontSize: "1.25rem", letterSpacing: "2px", marginBottom: "1rem", fontWeight: "700", textTransform: "uppercase" }}>AFFORDABLE PRICING</h3>
              <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: "1.7" }}>Luxury aesthetics without the luxury markup.</p>
            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;