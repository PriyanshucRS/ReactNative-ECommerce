const productService = require("../service/product.service");

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// exports.getMyProducts = async (req, res) => {
//   try {
//     console.log("🔍 Fetching products for user:", req.user.id);
//     const products = await productService.getProductsByUserId(req.user.id);
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.addProduct = async (req, res) => {
  try {
    console.log("📝 Add Product Request:", req.body);
    console.log("👤 User ID:", req.user.id);
    
    const userId = req.user.id;
    const newProduct = await productService.createProduct(req.body, userId);
    
    console.log("✅ Product Created:", newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error in addProduct:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deletedProduct = await productService.deleteProduct(id, userId);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    const statusCode = error.message.includes("only delete") ? 401 : 400;
    res.status(statusCode).json({ message: error.message });
  }
};

