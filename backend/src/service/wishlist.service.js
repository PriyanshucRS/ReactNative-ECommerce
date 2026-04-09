const { db } = require('./firebaseService');
const productsRef = db.collection('products');
const watchlistRef = db.collection('watchlist');

const getItemProductId = item => item?.productId || item?.id || item?._id;

const resolveProductDocumentById = async productId => {
  if (!productId) return null;

  const productDoc = await productsRef.doc(productId).get();
  if (!productDoc.exists) return null;
  return { id: productDoc.id, data: productDoc.data() };
};

// Get wishlist by user
const getWatchlistByUser = async userId => {
  const watchlistDoc = await watchlistRef.doc(userId).get();
  if (!watchlistDoc.exists) return { items: [] };

  const data = watchlistDoc.data();
  const items = data?.items || [];

  // Mark items as unavailable if the product was deleted from `products`.
  const cleaned = [];
  for (const item of items) {
    const storedProductId = getItemProductId(item);
    const resolvedProduct = await resolveProductDocumentById(storedProductId);
    if (resolvedProduct) {
      cleaned.push({
        ...item,
        productId: resolvedProduct.id,
        unavailable: false,
        // Refresh latest product fields so updates reflect in watchlist.
        title: resolvedProduct.data.title,
        price: resolvedProduct.data.price,
        image: resolvedProduct.data.image,
        category: resolvedProduct.data.category,
        description: resolvedProduct.data.description,
      });
    } else {
      cleaned.push({
        ...item,
        productId: storedProductId,
        unavailable: true,
      });
    }
  }

  // Persist refreshed items back to Firestore so DB stays in sync.
  if (cleaned.length === 0) {
    await watchlistRef.doc(userId).delete();
    return { items: [] };
  }

  await watchlistRef.doc(userId).set(
    {
      ...data,
      items: cleaned,
      updatedAt: new Date(),
    },
    { merge: true },
  );

  return { ...data, items: cleaned };
};

// Toggle wishlist item
const toggleWishlist = async (userId, productId) => {
  const wishlistDoc = await watchlistRef.doc(userId).get();
  let items = [];

  if (wishlistDoc.exists) {
    items = wishlistDoc.data().items || [];
  }

  // If item already exists in wishlist, allow removal even if product is deleted.
  const itemIndex = items.findIndex(item => getItemProductId(item) === productId);
  if (itemIndex > -1) {
    items.splice(itemIndex, 1);
  } else {
    // Add to wishlist only if product exists.
    const resolvedProduct = await resolveProductDocumentById(productId);
    if (!resolvedProduct) throw new Error('Product not found');

    const product = resolvedProduct.data;
    const resolvedProductId = resolvedProduct.id;

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
