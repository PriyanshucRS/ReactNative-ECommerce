const WatchList = require("../models/Wishlist");
const Product = require("../models/Product");

const getWatchlistByUser = async (userId) => {
  return await WatchList.findOne({ userId });
};

const toggleWishlist = async (userId, productId) => {
  let watchlist = await WatchList.findOne({ userId });

  if (!watchlist) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    watchlist = new WatchList({
      userId,
      items: [
        {
          productId,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
        },
      ],
    });
    return await watchlist.save();
  }

  const itemIndex = watchlist.items.findIndex(
    (item) => item.productId.toString() === productId,
  );

  if (itemIndex > -1) {
    watchlist.items.splice(itemIndex, 1);
    
    
    if (watchlist.items.length === 0) {
      await WatchList.findByIdAndDelete(watchlist._id);
      return { items: [] };
    }
  } else {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    watchlist.items.push({
      productId,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
    });
  }

  return await watchlist.save();
};

module.exports = { getWatchlistByUser, toggleWishlist };
