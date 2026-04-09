const { db } = require('./firebaseService');

// Firestore collection reference
const productsRef = db.collection('products');
const cartsRef = db.collection('carts');
const watchlistRef = db.collection('watchlist');

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

// Update product (only owner)
const updateProduct = async (id, userId, updates) => {
  const doc = await productsRef.doc(id).get();
  if (!doc.exists) throw new Error('Product not found');

  const productData = doc.data();
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

  await productsRef.doc(id).update({
    ...safeUpdates,
    updatedAt: new Date(),
  });

  const updatedDoc = await productsRef.doc(id).get();

  // Propagate product changes into carts and watchlists immediately,
  // so Firestore DB stays in sync without waiting for UI refresh.
  const updatedProduct = updatedDoc.data() || {};

  const getItemStoredProductId = item =>
    item?.productId || item?.id || item?._id;

  // Firestore nested array queries may require composite indexes, so we do a
  // safe scan to guarantee DB consistency (small project scale).
  const cartsSnap = await cartsRef.get();
  const cartBatchUpdates = cartsSnap.docs
    .filter(docRef =>
      (docRef.data()?.items || []).some(i => getItemStoredProductId(i) === id),
    )
    .map(async docRef => {
      const cartData = docRef.data() || {};
      const items = cartData.items || [];
      const nextItems = items.map(item =>
        getItemStoredProductId(item) === id
          ? {
              ...item,
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
      await docRef.ref.set(
        { items: nextItems, updatedAt: new Date() },
        { merge: true },
      );
    });
  await Promise.all(cartBatchUpdates);

  const watchSnap = await watchlistRef.get();
  const watchBatchUpdates = watchSnap.docs
    .filter(docRef =>
      (docRef.data()?.items || []).some(i => getItemStoredProductId(i) === id),
    )
    .map(async docRef => {
      const watchData = docRef.data() || {};
      const items = watchData.items || [];
      const nextItems = items.map(item =>
        getItemStoredProductId(item) === id
          ? {
              ...item,
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
      await docRef.ref.set(
        { items: nextItems, updatedAt: new Date() },
        { merge: true },
      );
    });
  await Promise.all(watchBatchUpdates);

  return { id: updatedDoc.id, ...updatedDoc.data() };
};

module.exports = {
  getAllProducts,
  getProductsByUserId,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
};
