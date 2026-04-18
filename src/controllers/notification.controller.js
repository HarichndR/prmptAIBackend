const Notification = require('../models/Notification.model');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('promptId', 'title');

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  sendResponse(res, 200, 'Notifications fetched', {
    notifications,
    unreadCount,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  sendResponse(res, 200, 'All notifications marked as read');
});
