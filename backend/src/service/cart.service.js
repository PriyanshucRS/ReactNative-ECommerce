// Firebase reference kept for migration history:
// const { db } = require('./firebaseService');
// const cartsRef = db.collection('carts');
// const productsRef = db.collection('products');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const calculateTotal = items =>
  items
    .filter(item => !item.unavailable)
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

const getItemProductId = item => item?.productId || item?.id || item?._id;

const resolveProductDocumentById = async productId => {
  if (!productId) return null;
  const productDoc = await Product.findById(productId);
  if (!productDoc) return null;
  return { id: String(productDoc._id), data: productDoc.toObject() };
};

// Mark invalid products instead of removing them
const cleanInvalidProducts = async items => {
  const cleaned = [];
  for (const item of items) {
    const plainItem =
      typeof item?.toObject === 'function' ? item.toObject() : item;
    const storedProductId = getItemProductId(item);
    const resolvedProduct = await resolveProductDocumentById(storedProductId);
    if (resolvedProduct) {
      cleaned.push({
        ...plainItem,
        productId: resolvedProduct.id,
        unavailable: false,
        // Refresh latest product fields so updates reflect in cart.
        title: resolvedProduct.data.title,
        price: resolvedProduct.data.price,
        image: resolvedProduct.data.image,
        category: resolvedProduct.data.category,
        description: resolvedProduct.data.description,
      });
    } else {
      cleaned.push({
        ...plainItem,
        productId: storedProductId,
        unavailable: true,
      });
    }
  }
  return cleaned;
};

// Get cart by user ID
const getCartByUserId = async userId => {
  const cartDoc = await Cart.findOne({ userId });
  if (!cartDoc) return { items: [], totalPrice: 0 };
  let items = cartDoc.items || [];

  // Clean invalid products
  items = await cleanInvalidProducts(items);

  // Persist cleaned cart
  cartDoc.items = items;
  await cartDoc.save();

  return {
    items,
    totalPrice: calculateTotal(items),
  };
};

// Add item to cart
const addItemToCart = async (userId, productId, quantity) => {
  const resolvedProduct = await resolveProductDocumentById(productId);
  if (!resolvedProduct) throw new Error('Product not found');

  const product = resolvedProduct.data;
  const resolvedProductId = resolvedProduct.id;
  const cartDoc = await Cart.findOne({ userId });
  let items = cartDoc?.items || [];

  const itemIndex = items.findIndex(
    item => getItemProductId(item) === resolvedProductId,
  );
  if (itemIndex > -1) {
    items[itemIndex].quantity += quantity;
  } else {
    items.push({
      productId: resolvedProductId,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      quantity,
    });
  }

  // Clean invalid products using reusable function
  items = await cleanInvalidProducts(items);

  await Cart.findOneAndUpdate(
    { userId },
    { $set: { userId, items } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
  return { items, totalPrice: calculateTotal(items) };
};

// Update item quantity
const updateItemQuantity = async (userId, productId, quantity) => {
  const cartDoc = await Cart.findOne({ userId });
  if (!cartDoc) throw new Error('Cart not found');
  const cart = cartDoc.toObject();
  const normalizedProductId = String(productId || '');
  const normalizedQuantity = Number(quantity);
  const itemIndex = cart.items.findIndex(
    item => String(getItemProductId(item) || '') === normalizedProductId,
  );
  if (itemIndex === -1) throw new Error('Item not found in cart');
  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 1) {
    throw new Error('Invalid quantity');
  }

  cart.items[itemIndex].quantity = normalizedQuantity;

  cartDoc.items = cart.items;
  await cartDoc.save();
  return { items: cart.items, totalPrice: calculateTotal(cart.items) };
};

// Remove item from cart
const removeItemFromCart = async (userId, productId) => {
  const cartDoc = await Cart.findOne({ userId });
  if (!cartDoc) throw new Error('Cart not found');
  let cart = cartDoc.toObject();
  cart.items = cart.items.filter(item => getItemProductId(item) !== productId);

  if (cart.items.length === 0) {
    await Cart.deleteOne({ userId });
    return { items: [], totalPrice: 0 };
  }

  cartDoc.items = cart.items;
  await cartDoc.save();
  return { items: cart.items, totalPrice: calculateTotal(cart.items) };
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
