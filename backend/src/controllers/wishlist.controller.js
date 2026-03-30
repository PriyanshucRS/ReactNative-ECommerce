const wishlistService = require("../service/wishlist.service");

exports.updateWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await wishlistService.toggleWishlist(req.user.id, productId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const result = await wishlistService.getWatchlistByUser(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
};
