const Prompt = require('../models/Prompt.model');
const User = require('../models/User.model');
const Like = require('../models/Like.model');
const Save = require('../models/Save.model');
const Comment = require('../models/Comment.model');
const Notification = require('../models/Notification.model');
const imageService = require('../services/image.service');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const { PROMPT_STATUS } = require('../constants');

exports.getAdminStats = asyncHandler(async (req, res) => {
  const [totalPrompts, pendingPrompts, totalUsers, approvedPrompts] = await Promise.all([
    Prompt.countDocuments(),
    Prompt.countDocuments({ status: PROMPT_STATUS.PENDING }),
    User.countDocuments(),
    Prompt.countDocuments({ status: PROMPT_STATUS.APPROVED }),
  ]);

  sendResponse(res, 200, 'Admin stats fetched', {
    totalPrompts,
    pendingPrompts,
    totalUsers,
    approvedPrompts,
  });
});

exports.getAllPrompts = asyncHandler(async (req, res) => {
  const { status, search, sort } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } }
    ];
  }

  // Sorting logic
  let sortOrder = { createdAt: -1 };
  if (sort === 'oldest') sortOrder = { createdAt: 1 };
  if (sort === 'title') sortOrder = { title: 1 };

  const prompts = await Prompt.find(query)
    .sort(sortOrder)
    .populate('category', 'name')
    .populate('author', 'name');

  sendResponse(res, 200, 'All prompts fetched', prompts);
});

exports.approvePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findByIdAndUpdate(req.params.id, { status: PROMPT_STATUS.APPROVED }, { new: true });
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');
  
  // NOTIFICATION: Notify author of approval
  await Notification.create({
    recipient: prompt.author,
    type: 'prompt_approved',
    promptId: prompt._id,
    actorName: 'System'
  });

  sendResponse(res, 200, 'Prompt approved', prompt);
});

exports.rejectPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');

  if (prompt.imagePublicId) {
    await imageService.deleteImage(prompt.imagePublicId);
  }

  await Prompt.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, 'Prompt rejected and deleted');
});

exports.updatePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');
  sendResponse(res, 200, 'Prompt updated', prompt);
});

exports.deletePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');

  if (prompt.imagePublicId) {
    await imageService.deleteImage(prompt.imagePublicId);
  }

  await Prompt.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, 'Prompt deleted');
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) return sendResponse(res, 404, 'User not found');

  // 1. Cleanup Prompts + Cloudinary Images
  const userPrompts = await Prompt.find({ author: userId });
  for (const prompt of userPrompts) {
    if (prompt.imagePublicId) {
      await imageService.deleteImage(prompt.imagePublicId).catch(() => {});
    }
  }
  await Prompt.deleteMany({ author: userId });

  // 2. Cleanup Engagement Data
  await Like.deleteMany({ userId });
  await Save.deleteMany({ userId });
  await Comment.deleteMany({ author: userId });

  // 3. Cleanup Notifications (both as recipient and actor)
  await Notification.deleteMany({ recipient: userId });

  // 4. Finally delete the User
  await User.findByIdAndDelete(userId);

  sendResponse(res, 200, 'User and all associated data deleted successfully');
});

