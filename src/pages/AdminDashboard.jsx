import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { ClipLoader } from "react-spinners";
import { Toaster, toast } from "react-hot-toast";

function Admin() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    countInStock: "",
    category: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role!== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        API.get("/products"),
        API.get("/orders")
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("SESSION EXPIRED - PLEASE LOGIN AGAIN");
        setTimeout(() => {
          localStorage.removeItem("userInfo");
          navigate("/login");
        }, 2000);
      } else {
        toast.error("FAILED TO LOAD DATA");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({...form, [name]: value });
    if (errors[name]) {
      setErrors({...errors, [name]: "" });
    }
  };

  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    let cleaned = priceString.toString().toLowerCase().replace(/[$,\s]/g, '');
    if (cleaned.includes('k')) {
      cleaned = cleaned.replace('k', '');
      return Number(cleaned) * 1000;
    }
    return Number(cleaned);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setErrors({...errors, image: "" });
    const toastId = toast.loading("Uploading image...");

    try {
      const { data } = await API.post('/upload', formData);
      const imageUrl = data.startsWith('http')
       ? data
        : `http://localhost:4000${data}`;
      setForm({...form, image: imageUrl });
      toast.dismiss(toastId);
      toast.success("IMAGE UPLOADED ✅");
      setUploading(false);
    } catch (error) {
      toast.dismiss(toastId);
      const errorMsg = error.response?.data?.message || "IMAGE UPLOAD FAILED";
      toast.error(errorMsg);
      setErrors({...errors, image: errorMsg });
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price) newErrors.price = "Price is required";
    if (!form.countInStock) newErrors.countInStock = "Stock quantity is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.image) newErrors.image = "Please upload an image";
    if (!form.description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      countInStock: product.countInStock,
      category: product.category || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      price: "",
      image: "",
      description: "",
      countInStock: "",
      category: ""
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("PLEASE FIX THE ERRORS");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editingProduct? "Updating product..." : "Creating product...");

    try {
      const productData = {
       ...form,
        price: parsePrice(form.price),
        countInStock: Number(form.countInStock)
      };

      if (editingProduct) {
        await API.put(`/products/${editingProduct}`, productData);
        toast.dismiss(toastId);
        toast.success("PRODUCT UPDATED 🔥");
      } else {
        await API.post("/products", productData);
        toast.dismiss(toastId);
        toast.success("PRODUCT ADDED SUCCESSFULLY 🔥");
      }

      cancelEdit();
      fetchData();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "ERROR SAVING PRODUCT");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmAction({
      text: "Delete this product?",
      onConfirm: async () => {
        try {
          await API.delete(`/products/${id}`);
          toast.success("PRODUCT DELETED");
          fetchData();
          setConfirmAction(null);
        } catch (err) {
          toast.error("ERROR DELETING PRODUCT");
          setConfirmAction(null);
        }
      }
    });
  };

  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  if (loading) return (
    <div className="page-dark">
      <Navbar />
      <div style={{
        padding: "4rem",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <ClipLoader size={50} color="#FF0000" />
      </div>
    </div>
  );

  const inputStyle = (fieldName) => ({
    background: '#1a1a1a',
    border: 'none',
    borderBottom: errors[fieldName]? '2px solid #ff0000' : '2px solid #333',
    padding: '12px 0',
    color: '#fff',
    borderRadius: '0',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s'
  });

  return (
    <div className="page-dark">
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#000',
            border: '1px solid #333',
            fontWeight: '700',
            letterSpacing: '0.5px'
          },
          success: { iconTheme: { primary: '#00ff00', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff0000', secondary: '#fff' } },
        }}
      />

      <div className="admin-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem' }}>ADMIN DASHBOARD</h1>

        {confirmAction && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#111', border: '2px solid #fff', padding: '30px',
              maxWidth: '400px', textAlign: 'center', borderRadius: '8px'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '25px', textTransform: 'uppercase' }}>
                {confirmAction.text}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={confirmAction.onConfirm}
                  style={{ background: '#fff', color: '#000', border: 'none', padding: '12px 30px', fontWeight: '900', cursor: 'pointer' }}>
                  YES
                </button>
                <button onClick={() => setConfirmAction(null)}
                  style={{ background: 'transparent', color: '#fff', border: '2px solid #fff', padding: '12px 30px', fontWeight: '900', cursor: 'pointer' }}>
                  NO
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-box" style={{ background: '#111', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{products.length}</h3>
            <p style={{ color: '#777', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>TOTAL PRODUCTS</p>
          </div>
          <div className="stat-box" style={{ background: '#111', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{orders.length}</h3>
            <p style={{ color: '#777', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>TOTAL ORDERS</p>
          </div>
          <div className="stat-box" style={{ background: '#111', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>₦{totalRevenue.toLocaleString()}</h3>
            <p style={{ color: '#777', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>TOTAL REVENUE</p>
          </div>
        </div>

        <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333' }}>
          <button
            onClick={() => setActiveTab("products")}
            style={{
              background: activeTab === "products"? '#fff' : 'transparent',
              color: activeTab === "products"? '#000' : '#fff',
              border: 'none', padding: '12px 24px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            PRODUCTS
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              background: activeTab === "orders"? '#fff' : 'transparent',
              color: activeTab === "orders"? '#000' : '#fff',
              border: 'none', padding: '12px 24px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            ORDERS
          </button>
        </div>

        {activeTab === "products" && (
          <>
            <div className="admin-box" style={{ background: '#111', border: '1px solid #333', padding: '2rem', borderRadius: '8px', maxWidth: '700px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editingProduct? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</h2>
                {editingProduct && (
                  <button onClick={cancelEdit} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 16px', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} style={inputStyle('name')} />
                  {errors.name && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.name}</p>}
                </div>

                <div>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle('category')}>
                    <option value="">Select Category</option>
                    <option value="TOPS">TOPS</option>
                    <option value="JEANS">JEANS</option>
                    <option value="CAPS">CAPS</option>
                    <option value="SNEAKERS">SNEAKERS</option>
                    <option value="HOODIES">HOODIES</option>
                    <option value="SHORTJEANS">SHORTJEANS</option>
                  </select>
                  {errors.category && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.category}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <input name="price" type="text" placeholder="Price e.g. 59000 or 50k" value={form.price} onChange={handleChange} style={inputStyle('price')} />
                    {errors.price && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.price}</p>}
                  </div>
                  <div>
                    <input name="countInStock" type="number" placeholder="Stock Quantity" value={form.countInStock} onChange={handleChange} style={inputStyle('countInStock')} />
                    {errors.countInStock && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.countInStock}</p>}
                  </div>
                </div>

                <div>
                  <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows="3"
                    style={{ background: '#1a1a1a', border: 'none', borderBottom: errors.description? '2px solid #ff0000' : '2px solid #333', padding: '12px 0', color: '#fff', width: '100%' }} />
                  {errors.description && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.description}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#777' }}>Product Image</label>
                  <input type="file" onChange={uploadFileHandler} accept="image/*" disabled={uploading}
                    style={{ background: '#1a1a1a', border: 'none', borderBottom: errors.image? '2px solid #ff0000' : '2px solid #333', padding: '12px 0', color: '#fff', width: '100%' }} />
                  {uploading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem', color: '#777' }}>
                      <ClipLoader size={16} color="#FF0000" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                  {errors.image && <p style={{ color: '#ff0000', fontSize: '0.8rem' }}>{errors.image}</p>}
                  {form.image &&!uploading && (
                    <div style={{ marginTop: '1rem' }}>
                      <img src={form.image} alt="preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={submitting || uploading}
                  style={{ background: submitting || uploading? '#333' : '#fff', color: submitting || uploading? '#777' : '#000', border: 'none', padding: '14px', fontWeight: '900', cursor: submitting || uploading? 'not-allowed' : 'pointer' }}>
                  {submitting? (editingProduct? 'UPDATING...' : 'ADDING...') : uploading? 'WAIT FOR IMAGE UPLOAD...' : editingProduct? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                </button>
              </form>
            </div>

            <div className="admin-box" style={{ background: '#111', border: '1px solid #333', padding: '2rem', borderRadius: '8px' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>ALL PRODUCTS ({products.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map((product) => (
                  <div key={product._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#1a1a1a', borderRadius: '4px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h4>
                      <p style={{ margin: 0, color: '#777' }}>₦{product.price.toLocaleString()}</p>
                      <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>
                        Category: {product.category} | Stock: {product.countInStock}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(product)} style={{ background: '#00ff00', color: '#000', border: 'none', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}>EDIT</button>
                      <button onClick={() => handleDelete(product._id)} style={{ background: '#ff0000', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}>DELETE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="admin-box" style={{ background: '#111', border: '1px solid #333', padding: '2rem', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>ALL ORDERS ({orders.length})</h2>
            {orders.length === 0? (
              <p style={{ color: "#777" }}>No orders yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#1a1a1a', borderRadius: '4px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Order #{order._id.slice(-6)}</h4>
                      <p style={{ margin: 0, color: '#777' }}>Customer: {order.user?.firstName || "Guest"}</p>
                      <p style={{ margin: 0, color: order.isDelivered? '#00ff00' : '#ff0000', fontSize: '0.9rem' }}>
                        Status: {order.isDelivered? 'Delivered' : 'Processing'}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>₦{order.totalPrice?.toLocaleString()}</h4>
                      <p style={{ color: "#777", margin: 0 }}>{order.orderItems?.length} items</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Admin;