import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Admin from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import "./index.css";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Order from "./pages/Order"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />        
        <Route path="/landing" element={<Landing />} />
        
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<h1 style={{color: '#fff', textAlign: 'center', padding: '4rem'}}>404 - PAGE NOT FOUND</h1>} />
      </Routes>
    </Router>
  );
}

export default App;