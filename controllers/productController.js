const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Fetch all products with filter & search - SHOW APPROVED + OLD PRODUCTS
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  // Show products that are approved OR old products without status field
  const query = { 
    $or: [
      { status: 'approved' },
      { status: { $exists: false } }
    ]
  };

  // Filter by category if sent
  if (category && category !== "allproducts") {
    query.category = { $regex: category, $options: "i" };
  }

  // Search by name, description, category
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

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Admin: Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  const product = new Product({
    name,
    description,
    price,
    image,
    category,
    stock,
    status: "approved" // Admin products auto-approved
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Admin: Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock, status } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.status = status || product.status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Admin: Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
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

// @desc    User: Submit product for approval
// @route   POST /api/products/submit
// @access  Private
const submitProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  const product = new Product({
    name,
    description,
    price,
    image,
    category,
    stock,
    seller: req.user._id,
    status: "pending" // Wait for admin approval
  });

  const createdProduct = await product.save();
  res.status(201).json({ message: "Product submitted for approval", product: createdProduct });
});

// @desc    Admin: Get pending products
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "pending" }).populate("seller", "name email");
  res.json(products);
});

// @desc    Admin: Approve product
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