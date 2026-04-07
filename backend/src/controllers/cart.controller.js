const cartService = require('../service/cart.service');
const getUserIdFromRequest = req => req.user?.id || req.user?.uid || req.user?.userId;

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId)
      return res.status(400).json({ message: 'productId required' });

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const result = await cartService.addItemToCart(userId, productId, quantity);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const cart = await cartService.getCartByUserId(userId);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const cart = await cartService.removeItemFromCart(userId, productId);
    res.json({ success: true, ...cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1)
      return res.status(400).json({ message: 'valid quantity required' });

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const result = await cartService.updateItemQuantity(
      userId,
      productId,
      quantity,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
