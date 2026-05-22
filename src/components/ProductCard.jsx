import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import toast from "react-hot-toast";

const ProductCard = ({ product, activeCategory }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent Link navigation

    if (!user) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }

    dispatch(addToCart({...product, qty: 1 }));
    toast.success("Added to cart!");
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      state={{ fromCategory: activeCategory || "ALL PRODUCTS" }}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <div className="w-full h-64 bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.category}</p>
          <p className="text-xl font-bold text-green-600 mb-4">₦{product.price.toLocaleString()}</p>

          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;