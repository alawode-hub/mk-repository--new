const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true }, // "men", "women", "unisex"
  size: [{ type: String }], // ["S", "M", "L", "XL"]
  color: [{ type: String }], // ["black", "white", "beige"]
  image: { type: String, required: true },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;