const productService = require('../service/product.service');
const getUserIdFromRequest = req => req.user?.id || req.user?.uid || req.user?.userId;

exports.getProducts = async (req, res) => {
  try {
    const { category, maxPrice } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (maxPrice) filters.maxPrice = maxPrice;

    const products = await productService.getAllProducts(filters);
    res.json({ success: true, products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({ success: true, product });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const product = await productService.createProduct(req.body, userId);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const deleted = await productService.deleteProduct(id, userId);
    res.json({ success: true, message: 'Product deleted', product: deleted });
  } catch (error) {
    const status = error.message.includes('own products') ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const products = await productService.getProductsByUserId(userId);
    res.json({ success: true, products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const updated = await productService.updateProduct(id, userId, req.body);
    res.json({ success: true, product: updated });
  } catch (error) {
    const status = error.message.includes('own products') ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
