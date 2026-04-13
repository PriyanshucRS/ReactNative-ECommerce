const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, default: 'Notification' },
    body: { type: String, trim: true, default: '' },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    source: { type: String, trim: true, default: 'local' },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
