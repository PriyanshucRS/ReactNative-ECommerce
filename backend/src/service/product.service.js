const { db } = require('./firebaseService');

// Firestore collection reference
const productsRef = db.collection('products');

// Get all products
const getAllProducts = async (filters = {}) => {
  let query = productsRef;

  // Apply filters (price, category, etc.)
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  if (filters.maxPrice) {
    query = query.where('price', '<=', parseFloat(filters.maxPrice));
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get products by user ID
const getProductsByUserId = async userId => {
  const snapshot = await productsRef.where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get product by ID
const getProductById = async id => {
  const doc = await productsRef.doc(id).get();
  if (!doc.exists) throw new Error('Product not found');
  return { id: doc.id, ...doc.data() };
};

// Create product
const createProduct = async (productData, userId) => {
  const product = {
    ...productData,
    userId,
    createdAt: new Date(),
  };
  const docRef = await productsRef.add(product);
  return { id: docRef.id, ...product };
};

// Delete product
const deleteProduct = async (id, userId) => {
  const doc = await productsRef.doc(id).get();
  if (!doc.exists) throw new Error('Product not found');

  const productData = doc.data();
  if (productData.userId !== userId) {
    throw new Error('You can only delete your own products!');
  }

  await productsRef.doc(id).delete();
  return productData;
};

module.exports = {
  getAllProducts,
  getProductsByUserId,
  getProductById,
  createProduct,
  deleteProduct,
};
