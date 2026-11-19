const { NotificationModel } = require('../models');

class NotificationService {
  static async send({ userId, message, eventType = 'general', details = {} }) {
    return await NotificationModel.create({
      userId,
      message,
      eventType,
      details,
      readStatus: false,
      timestamp: new Date().toISOString()
    });
  }

  static async getUserNotifications(userId) {
    return await NotificationModel.find({ userId }, { sort: { timestamp: -1 } });
  }

  static async markAsRead(notificationId, userId) {
    return await NotificationModel.updateOne(
      { _id: notificationId, userId },
      { $set: { readStatus: true } }
    );
  }

  static async markAllAsRead(userId) {
    const notifications = await NotificationModel.find({ userId, readStatus: false });
    for (const notif of notifications) {
      await NotificationModel.updateOne({ _id: notif._id }, { $set: { readStatus: true } });
    }
    return { success: true, count: notifications.length };
  }
}

module.exports = NotificationService;
