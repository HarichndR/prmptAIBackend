const express = require('express');
const { getAdminStats, getAllPrompts, approvePrompt, rejectPrompt, updatePrompt, deletePrompt, deleteUser } = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/prompts', getAllPrompts);
router.put('/prompts/:id/approve', approvePrompt);
router.put('/prompts/:id/reject', rejectPrompt);
router.put('/prompts/:id', updatePrompt);
router.delete('/prompts/:id', deletePrompt);
router.delete('/users/:id', deleteUser);

module.exports = router;
