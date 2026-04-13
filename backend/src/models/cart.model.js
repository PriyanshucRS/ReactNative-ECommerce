const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, default: '' },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unavailable: { type: Boolean, default: false },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
