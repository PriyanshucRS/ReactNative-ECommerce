// Firebase reference kept for migration history:
// const { db } = require('./firebaseService');
// const productsRef = db.collection('products');
// const cartsRef = db.collection('carts');
// const watchlistRef = db.collection('watchlist');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Wishlist = require('../models/wishlist.model');

const toProductResponse = doc => {
  const obj = doc.toObject();
  return {
    id: String(obj._id),
    ...obj,
    _id: undefined,
    __v: undefined,
  };
};

// Get all products
const getAllProducts = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.maxPrice) query.price = { $lte: parseFloat(filters.maxPrice) };
  const docs = await Product.find(query).sort({ createdAt: -1 });
  return docs.map(toProductResponse);
};

// Get products by user ID
const getProductsByUserId = async userId => {
  const docs = await Product.find({ userId }).sort({ createdAt: -1 });
  return docs.map(toProductResponse);
};

// Get product by ID
const getProductById = async id => {
  const doc = await Product.findById(id);
  if (!doc) throw new Error('Product not found');
  return toProductResponse(doc);
};

// Create product
const createProduct = async (productData, userId) => {
  const doc = await Product.create({
    ...productData,
    userId,
  });
  return toProductResponse(doc);
};

// Delete product
const deleteProduct = async (id, userId) => {
  const doc = await Product.findById(id);
  if (!doc) throw new Error('Product not found');
  const productData = doc.toObject();
  if (productData.userId !== userId) {
    throw new Error('You can only delete your own products!');
  }

  await Product.deleteOne({ _id: id });
  return productData;
};

// Update product (only owner)
const updateProduct = async (id, userId, updates) => {
  const doc = await Product.findById(id);
  if (!doc) throw new Error('Product not found');
  const productData = doc.toObject();
  if (productData.userId !== userId) {
    throw new Error('You can only edit your own products!');
  }

  const allowedFields = ['title', 'price', 'description', 'category', 'image'];
  const safeUpdates = {};

  allowedFields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      safeUpdates[field] = updates[field];
    }
  });

  if (Object.keys(safeUpdates).length === 0) {
    return { id, ...productData };
  }

  const updatedDoc = await Product.findByIdAndUpdate(
    id,
    { $set: safeUpdates },
    { returnDocument: 'after' },
  );
  const updatedProduct = updatedDoc?.toObject() || {};

  const getItemStoredProductId = item =>
    item?.productId || item?.id || item?._id;

  const carts = await Cart.find({
    items: { $elemMatch: { productId: id } },
  });
  await Promise.all(
    carts.map(async cartDoc => {
      const nextItems = (cartDoc.items || []).map(item =>
        getItemStoredProductId(item) === id
          ? {
              ...item.toObject(),
              productId: id,
              title: updatedProduct.title,
              price: updatedProduct.price,
              image: updatedProduct.image,
              category: updatedProduct.category,
              description: updatedProduct.description,
              unavailable: false,
            }
          : item,
      );
      cartDoc.items = nextItems;
      await cartDoc.save();
    }),
  );

  const watchlists = await Wishlist.find({
    items: { $elemMatch: { productId: id } },
  });
  await Promise.all(
    watchlists.map(async watchDoc => {
      const nextItems = (watchDoc.items || []).map(item =>
        getItemStoredProductId(item) === id
          ? {
              ...item.toObject(),
              productId: id,
              title: updatedProduct.title,
              price: updatedProduct.price,
              image: updatedProduct.image,
              category: updatedProduct.category,
              description: updatedProduct.description,
              unavailable: false,
            }
          : item,
      );
      watchDoc.items = nextItems;
      await watchDoc.save();
    }),
  );

  return toProductResponse(updatedDoc);
};

module.exports = {
  getAllProducts,
  getProductsByUserId,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
};
