const Notification = require('../models/notification.model');

const createNotification = async (userId, payload) => {
  const title = `${payload?.title || 'Notification'}`.trim();
  const body = `${payload?.body || ''}`.trim();
  const source = `${payload?.source || 'local'}`.trim();
  console.log('[Notification][Backend][Service] create start', {
    userId,
    title,
    hasBody: !!body,
    source,
  });

  // Deduplicate rapid repeats (same content from double-triggered UI actions).
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  const existing = await Notification.findOne({
    userId,
    title,
    body,
    createdAt: { $gte: fiveSecondsAgo },
  }).lean();
  if (existing) {
    console.log('[Notification][Backend][Service] duplicate skipped', {
      userId,
      notificationId: existing._id,
    });
    return existing;
  }

  const notification = await Notification.create({
    userId,
    title,
    body,
    source,
    read: false,
  });
  console.log('[Notification][Backend][Service] create success', {
    userId,
    notificationId: notification._id,
  });
  return notification.toObject();
};

const listNotifications = async userId => {
  const docs = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return docs;
};

const markNotificationRead = async (userId, id) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read: true, readAt: new Date() } },
    { new: true },
  ).lean();
  return result;
};

const deleteNotification = async (userId, id) => {
  const result = await Notification.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
};

const clearAllNotifications = async userId => {
  const result = await Notification.deleteMany({ userId });
  return result.deletedCount || 0;
};

const deleteSelectedNotifications = async (userId, ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const result = await Notification.deleteMany({ userId, _id: { $in: ids } });
  return result.deletedCount || 0;
};

module.exports = {
  createNotification,
  listNotifications,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  deleteSelectedNotifications,
};
