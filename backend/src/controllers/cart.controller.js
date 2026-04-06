const cartService = require('../service/cart.service');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: 'productId and quantity are required' });
    }

    const userId = req.user.id;
    const result = await cartService.addItemToCart(userId, productId, quantity);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const updatedCart = await cartService.removeItemFromCart(userId, productId);

    res.status(200).json({
      message: 'Item removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'quantity is required' });
    }

    const result = await cartService.updateItemQuantity(
      req.user.id,
      productId,
      quantity,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
