// Firebase reference kept for migration history:
// const { db } = require('./firebaseService');
// const productsRef = db.collection('products');
// const watchlistRef = db.collection('watchlist');
const Product = require('../models/product.model');
const Wishlist = require('../models/wishlist.model');

const getItemProductId = item => item?.productId || item?.id || item?._id;

const resolveProductDocumentById = async productId => {
  if (!productId) return null;
  const productDoc = await Product.findById(productId);
  if (!productDoc) return null;
  return { id: String(productDoc._id), data: productDoc.toObject() };
};

// Get wishlist by user
const getWatchlistByUser = async userId => {
  const watchlistDoc = await Wishlist.findOne({ userId });
  if (!watchlistDoc) return { items: [] };
  const data = watchlistDoc.toObject();
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

  // Persist refreshed items back so DB stays in sync.
  if (cleaned.length === 0) {
    await Wishlist.deleteOne({ userId });
    return { items: [] };
  }

  await Wishlist.findOneAndUpdate(
    { userId },
    { $set: { userId, items: cleaned } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  return { ...data, items: cleaned };
};

// Toggle wishlist item
const toggleWishlist = async (userId, productId) => {
  const wishlistDoc = await Wishlist.findOne({ userId });
  let items = wishlistDoc?.items || [];

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
    await Wishlist.deleteOne({ userId });
  } else {
    await Wishlist.findOneAndUpdate(
      { userId },
      { $set: { userId, items } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
  }

  return { items };
};

module.exports = {
  getWatchlistByUser,
  toggleWishlist,
};
