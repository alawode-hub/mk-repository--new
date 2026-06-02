const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Fetch all products with filter & search - ONLY APPROVED
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'approved' }; // <-- ADD THIS LINE

    // Filter by category if sent
    if (category && category !== "allproducts") {
      query.category = { $regex: category, $options: "i" }; // case-insensitive
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create product - Admin direct
// @route POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, countInStock, category, size, color } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      countInStock,
      category,
      size,
      color,
      submittedBy: req.user._id, // <-- CHANGE from user to submittedBy
      status: 'approved' // <-- Admin products auto-approved
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc User submit product for approval
// @route   POST /api/products/submit
// @access  Private
const submitProduct = asyncHandler(async (req, res) => {
  const { name, description, price, countInStock, category, image, size, color } = req.body;

  if (!name || !description || !price || !category || !image) {
    res.status(400);
    throw new Error("PLEASE FILL ALL REQUIRED FIELDS");
  }

  const product = new Product({
    name,
    description,
    price,
    countInStock: countInStock || 0,
    category,
    image,
    size: size || [],
    color: color || [],
    submittedBy: req.user._id,
    status: 'pending'
  });

  const createdProduct = await product.save();
  res.status(201).json({ message: "PRODUCT SUBMITTED FOR APPROVAL", product: createdProduct });
});

// @desc    Admin get all pending products
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('submittedBy', 'email firstName lastName');
  res.json(products);
});

// @desc    Admin approve or reject product
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.status = req.body.status; // 'approved' or 'rejected'
    const updatedProduct = await product.save();
    res.json({ message: `PRODUCT ${req.body.status.toUpperCase()}`, product: updatedProduct });
  } else {
    res.status(404);
    throw new Error("PRODUCT NOT FOUND");
  }
});

// @desc Update product
// @route PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, countInStock, category, size, color } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.image = image;
      product.countInStock = countInStock;
      product.category = category;
      product.size = size;
      product.color = color;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createProduct, 
  updateProduct, 
  getProducts, 
  getProductById, 
  deleteProduct,
  submitProduct,
  getPendingProducts,
  approveProduct
};

