const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

router.get('/', authMiddleware, notificationController.getNotifications);
router.post('/', authMiddleware, notificationController.createNotification);
router.patch('/:id/read', authMiddleware, notificationController.markRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);
router.delete('/clear-all/all', authMiddleware, notificationController.clearAll);
router.post('/delete-selected', authMiddleware, notificationController.deleteSelected);

module.exports = router;
