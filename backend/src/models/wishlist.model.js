const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, default: '' },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    unavailable: { type: Boolean, default: false },
  },
  { _id: false },
);

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
