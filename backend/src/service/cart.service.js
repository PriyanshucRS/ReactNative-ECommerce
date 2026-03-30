const Cart = require("../models/Cart");
const Product = require("../models/Product");



const getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return { items: [], totalPrice: 0 };
  return { items: cart.items, totalPrice: calculateTotal(cart.items) };
};

const addItemToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
          quantity,
        },
      ],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        quantity,
      });
    }
  }
  const savedCart = await cart.save();
  return {
    items: savedCart.items,
    totalPrice: calculateTotal(savedCart.items),
  };
};
const calculateTotal = (items) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    const savedCart = await cart.save();
    return {
      items: savedCart.items,
      totalPrice: calculateTotal(savedCart.items),
    };
  } else {
    throw new Error("Item not found in cart");
  }
};

const removeItemFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId,
  );
  
  
  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return {
      items: [],
      totalPrice: 0,
    };
  }
  
  const savedCart = await cart.save();
  return {
    items: savedCart.items,
    totalPrice: calculateTotal(savedCart.items),
  };
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
