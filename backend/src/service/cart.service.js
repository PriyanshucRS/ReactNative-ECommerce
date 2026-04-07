const { db } = require('./firebaseService');

// Firestore references
const cartsRef = db.collection('carts');
const productsRef = db.collection('products');

const calculateTotal = items =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

const resolveProductDocumentById = async productId => {
  if (!productId) return null;

  const productDoc = await productsRef.doc(productId).get();
  if (!productDoc.exists) return null;
  return { id: productDoc.id, data: productDoc.data() };
};

// Clean invalid products from cart items
const cleanInvalidProducts = async items => {
  const validItems = [];
  for (const item of items) {
    const resolvedProduct = await resolveProductDocumentById(item.productId);
    if (resolvedProduct) {
      validItems.push({
        ...item,
        productId: resolvedProduct.id,
      });
    }
  }
  return validItems;
};

// Get cart by user ID
const getCartByUserId = async userId => {
  const doc = await cartsRef.doc(userId).get();
  if (!doc.exists) return { items: [], totalPrice: 0 };
  let cart = doc.data();
  let items = cart?.items || [];

  // Clean invalid products
  items = await cleanInvalidProducts(items);

  // Persist cleaned cart
  await cartsRef.doc(userId).set({
    items,
    updatedAt: new Date(),
  });

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
  const cartDoc = await cartsRef.doc(userId).get();

  let items = [];
  if (cartDoc.exists) {
    items = cartDoc.data().items || [];
  }

  const itemIndex = items.findIndex(item => item.productId === resolvedProductId);
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

  await cartsRef.doc(userId).set({ items, updatedAt: new Date() });
  return { items, totalPrice: calculateTotal(items) };
};

// Update item quantity
const updateItemQuantity = async (userId, productId, quantity) => {
  const cartDoc = await cartsRef.doc(userId).get();
  if (!cartDoc.exists) throw new Error('Cart not found');

  const cart = cartDoc.data();
  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) throw new Error('Item not found in cart');

  cart.items[itemIndex].quantity = quantity;

  await cartsRef.doc(userId).set({ items: cart.items, updatedAt: new Date() });
  return { items: cart.items, totalPrice: calculateTotal(cart.items) };
};

// Remove item from cart
const removeItemFromCart = async (userId, productId) => {
  const cartDoc = await cartsRef.doc(userId).get();
  if (!cartDoc.exists) throw new Error('Cart not found');

  let cart = cartDoc.data();
  cart.items = cart.items.filter(item => item.productId !== productId);

  if (cart.items.length === 0) {
    await cartsRef.doc(userId).delete();
    return { items: [], totalPrice: 0 };
  }

  await cartsRef.doc(userId).set({ items: cart.items, updatedAt: new Date() });
  return { items: cart.items, totalPrice: calculateTotal(cart.items) };
};

module.exports = {
  getCartByUserId,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
