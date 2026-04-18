const express = require('express');
const { getPrompts, getPromptById, createPrompt, toggleLike, toggleSave, getSavedPrompts, getMyPrompts, updateMyPrompt, deleteMyPrompt } = require('../controllers/prompt.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createPromptSchema, updatePromptSchema, getPromptsSchema } = require('../validations/prompt.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', optionalAuth, validate(getPromptsSchema), getPrompts);
router.get('/saved', requireAuth, getSavedPrompts);
router.get('/my', requireAuth, getMyPrompts);
router.get('/:id', optionalAuth, getPromptById);
router.post('/', requireAuth, upload.single('image'), validate(createPromptSchema), createPrompt);
router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/save', requireAuth, toggleSave);
router.put('/:id', requireAuth, upload.single('image'), validate(updatePromptSchema), updateMyPrompt);
router.delete('/:id', requireAuth, deleteMyPrompt);

module.exports = router;

