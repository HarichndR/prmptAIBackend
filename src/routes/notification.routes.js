const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/read', markAsRead);

module.exports = router;
