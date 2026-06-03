const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Fetch all products - APPROVED + OLD PRODUCTS
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  const query = { 
    $or: [
      { status: 'approved' },
      { status: { $exists: false } }
    ]
  };

  if (category && category !== "allproducts") {
    query.category = { $regex: category, $options: "i" };
  }

  if (search) {
    query.$and = [
      query,
      {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Admin create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, countInStock } = req.body;
  const product = new Product({
    name, description, price, image, category, countInStock,
    status: "approved"
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, countInStock, status } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.status = status || product.status;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    User submit product
// @route   POST /api/products/submit
// @access  Private
const submitProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, countInStock, size, color } = req.body;
  const product = new Product({
    name, description, price, image, category, countInStock, size, color,
    seller: req.user._id, // <-- save who submitted
    status: "pending"
  });
  const createdProduct = await product.save();
  res.status(201).json({ message: "Product submitted for approval", product: createdProduct });
});

// @desc    Admin get pending
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "pending" }).populate("seller", "name email");
  res.json(products);
});

// @desc    Admin approve
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.status = "approved";
    const approvedProduct = await product.save();
    res.json(approvedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  submitProduct,
  getPendingProducts,
  approveProduct
};