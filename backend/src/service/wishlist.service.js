const { db } = require('./firebaseService');
const productsRef = db.collection('products');
const watchlistRef = db.collection('watchlist');

const resolveProductDocumentById = async productId => {
  if (!productId) return null;

  const productDoc = await productsRef.doc(productId).get();
  if (!productDoc.exists) return null;
  return { id: productDoc.id, data: productDoc.data() };
};

// Get wishlist by user
const getWatchlistByUser = async userId => {
  const watchlistDoc = await watchlistRef.doc(userId).get();
  if (watchlistDoc.exists) return watchlistDoc.data();
  return { items: [] };
};

// Toggle wishlist item
const toggleWishlist = async (userId, productId) => {
  const resolvedProduct = await resolveProductDocumentById(productId);
  if (!resolvedProduct) throw new Error('Product not found');

  const product = resolvedProduct.data;
  const resolvedProductId = resolvedProduct.id;

  const wishlistDoc = await watchlistRef.doc(userId).get();
  let items = [];

  if (wishlistDoc.exists) {
    items = wishlistDoc.data().items || [];
  }

  const itemIndex = items.findIndex(item => item.productId === resolvedProductId);
  if (itemIndex > -1) {
    // Remove from wishlist
    items.splice(itemIndex, 1);
  } else {
    // Add to wishlist
    items.push({
      productId: resolvedProductId,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
    });
  }

  if (items.length === 0) {
    await watchlistRef.doc(userId).delete();
  } else {
    await watchlistRef.doc(userId).set({ items, updatedAt: new Date() });
  }

  return { items };
};

module.exports = {
  getWatchlistByUser,
  toggleWishlist,
};
