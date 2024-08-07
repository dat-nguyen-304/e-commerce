const NotificationService = require('../services/notification.service');
const { OK } = require('../core/success.response');

class NotificationController {
  listNotificationsByUser = async (req, res, next) => {
    new OK({
      message: 'Get notifications successfully',
      metadata: await NotificationService.listNotificationsByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
