const wishlistService = require('../service/wishlist.service');
const getUserIdFromRequest = req => req.user?.id || req.user?.uid || req.user?.userId;

exports.updateWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ message: 'productId required' });

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const result = await wishlistService.toggleWishlist(userId, productId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const wishlist = await wishlistService.getWatchlistByUser(userId);
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
