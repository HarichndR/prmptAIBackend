const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants');
const imageService = require('../services/image.service');

const logger = require('../utils/logger');

const mapUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  role: user.role,
  onboardingCompleted: user.onboardingCompleted,
  interests: user.interests,
});


const generateTokenAndSetCookie = (res, userId, role, name) => {
  const token = jwt.sign({ userId, role, name }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });


  return token;
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return sendResponse(res, 400, 'User already exists');
  }

  const user = await User.create({ name, email, password, bio });
  generateTokenAndSetCookie(res, user._id, user.role, user.name);

  sendResponse(res, 201, 'User registered successfully', {
    user: mapUserResponse(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    logger.info(`[AUTH DIAGNOSTIC] Login failed: User not found for email |${email}|`);
    return sendResponse(res, 401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const dbPwdStart = user.password.substring(0, 7);
    const dbPwdLen = user.password.length;
    const isHashed = user.password.startsWith('$2');
    
    logger.info(`[AUTH DIAGNOSTIC] Password mismatch for |${email}|`);
    logger.info(`[AUTH DIAGNOSTIC] DB Password - Length: ${dbPwdLen}, Start: ${dbPwdStart}, Valid Hash Format: ${isHashed}`);
    logger.info(`[AUTH DIAGNOSTIC] Input Password - Length: ${password.length}`);
    
    return sendResponse(res, 401, 'Invalid email or password');
  }



  generateTokenAndSetCookie(res, user._id, user.role, user.name);

  sendResponse(res, 200, 'Logged in successfully', {
    user: mapUserResponse(user),
  });
});

exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  sendResponse(res, 200, 'Logged out successfully');
};

exports.completeOnboarding = asyncHandler(async (req, res) => {
  const { interests } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        onboardingCompleted: true,
        interests: interests || [],
      }
    },
    { new: true, runValidators: true }
  ).populate('interests');

  sendResponse(res, 200, 'Onboarding completed successfully', {
    user: mapUserResponse(user),
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('interests');
  sendResponse(res, 200, 'User profile fetched', {
    user: mapUserResponse(user),
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendResponse(res, 404, 'User identity not found');
  }

  const { name, avatar, bio, interests } = req.body;

  // 🛡️ ATOMIC STATE TRANSITION
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  
  if (avatar !== undefined && typeof avatar === 'string') {
    user.avatar = avatar;
  }

  if (interests) {
    try {
      const parsedInterests = typeof interests === 'string' 
        ? JSON.parse(interests) 
        : interests;
      user.interests = parsedInterests;
    } catch (e) {
      user.interests = interests;
    }
  }

  // 🖼️ IMAGE SYNCHRONIZATION
  if (req.file) {
    const uploadRes = await imageService.uploadImage(req.file.buffer);
    if (uploadRes && uploadRes.url) {
      user.avatar = uploadRes.url;
    }
  }

  // 🔥 SAVE TRIGGER (Triggers full model validation)
  await user.save();
  await user.populate('interests');

  sendResponse(res, 200, 'Identity synchronized successfully', {
    user: mapUserResponse(user),
  });
});
