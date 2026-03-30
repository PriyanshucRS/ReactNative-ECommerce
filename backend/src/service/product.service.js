const Product = require("../models/Product");

const getAllProducts = async (filters = {}) => {
  return await Product.find(filters);
};


const getProductsByUserId = async (userId) => {
  return await Product.find({ userId });
};

// const getProductById = async (id) => {
//   const product = await Product.findById(id);
//   if (!product) throw new Error("Product not found");
//   return product;
// };

const createProduct = async (productData, userId) => {
  const product = new Product({
    ...productData,
    userId,  
  });
  return await product.save();
};

const deleteProduct = async (id, userId) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.userId.toString() !== userId) {
    throw new Error("You can only delete your own products!");
  }
  await Product.findByIdAndDelete(id);
  return product;
};

module.exports = {
  getAllProducts,
  getProductsByUserId,
  // getProductById,
  createProduct,
  deleteProduct,
};
