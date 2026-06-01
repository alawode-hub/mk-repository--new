const Product = require("../models/Product");

// @desc Create product
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
      countInStock, // make sure na this one
      category,
      size,
      color,
      user: req.user._id
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
      product.countInStock = countInStock; // make sure na this one
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

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = { createProduct, updateProduct, getProducts, getProductById, deleteProduct };

