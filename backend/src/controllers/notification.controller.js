const notificationService = require('../service/notification.service');

const getUserIdFromRequest = req => req.user?.id || req.user?.uid || req.user?.userId;

exports.createNotification = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    console.log('[Notification][Backend] create request', {
      userId,
      title: req.body?.title,
      hasBody: !!req.body?.body,
      source: req.body?.source,
    });
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const notification = await notificationService.createNotification(userId, req.body || {});
    console.log('[Notification][Backend] create response', {
      notificationId: notification?._id,
      userId,
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('[Notification][Backend] create failed', {
      message: error.message,
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const notifications = await notificationService.listNotifications(userId);
    console.log('[Notification][Backend] list response', {
      userId,
      count: notifications.length,
    });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('[Notification][Backend] list failed', {
      message: error.message,
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const updated = await notificationService.markNotificationRead(userId, req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const ok = await notificationService.deleteNotification(userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const deletedCount = await notificationService.clearAllNotifications(userId);
    res.json({ success: true, deletedCount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSelected = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const deletedCount = await notificationService.deleteSelectedNotifications(
      userId,
      ids,
    );
    res.json({ success: true, deletedCount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
