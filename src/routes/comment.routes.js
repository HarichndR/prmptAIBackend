const express = require('express');
const { getComments, postComment } = require('../controllers/comment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/:promptId', getComments);
router.post('/:promptId', requireAuth, postComment);

module.exports = router;
