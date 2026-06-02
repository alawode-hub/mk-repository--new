// @desc    Fetch all products with filter & search - SHOW APPROVED + OLD PRODUCTS
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};