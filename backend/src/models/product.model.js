const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    image: { type: String, default: '' },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Product || mongoose.model('Product', productSchema);
