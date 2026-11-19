const NotificationService = require('../services/NotificationService');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.userId);
      const unreadCount = notifications.filter(n => !n.readStatus).length;
      res.json({
        success: true,
        unreadCount,
        count: notifications.length,
        notifications
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await NotificationService.markAsRead(id, req.user.userId);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.userId);
      res.json({ success: true, count: result.count, message: 'All notifications marked as read.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = NotificationController;
