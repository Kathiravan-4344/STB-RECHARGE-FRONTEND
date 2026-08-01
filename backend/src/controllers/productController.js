const Product = require("../models/Product");

// Seed default products helper
const DEFAULT_PRODUCTS = [
  {
    name: "HD Set Top Box Remote",
    price: 250,
    description: "Universal STB Remote compatible with all models",
    availableStock: 45,
  },
  {
    name: "HDMI Cable 1.5m",
    price: 150,
    description: "High speed 4K Gold Plated HDMI Cable",
    availableStock: 60,
  },
];

// @desc Get All Products
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    let products = await Product.find();
    if (products.length === 0) {
      products = await Product.insertMany(DEFAULT_PRODUCTS);
    }
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
};
