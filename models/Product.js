const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  size: [{ type: String }],
  color: [{ type: String }],
  image: { type: String, required: true },
  
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' 
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;