const express = require('express');
const { register, login, logout, getMe, updateProfile, completeOnboarding } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validations/auth.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, upload.single('image'), validate(updateProfileSchema), updateProfile);
router.put('/onboarding', requireAuth, completeOnboarding);

module.exports = router;
