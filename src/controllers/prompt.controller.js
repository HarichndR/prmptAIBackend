const Prompt = require('../models/Prompt.model');
const Like = require('../models/Like.model');
const Save = require('../models/Save.model');
const imageService = require('../services/image.service');
const scoreService = require('../services/score.service');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { PROMPT_STATUS, ROLES, PAGINATION } = require('../constants');

exports.getPrompts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const query = { status: PROMPT_STATUS.APPROVED };
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Interest-based personalization: boost prompts in user's interest categories
  const userInterests = req.user?.interests || [];
  
  let prompts;
  if (userInterests.length > 0 && !req.query.category) {
    // Fetch all, sort: user's interest categories first (by score desc), then rest
    const [interested, others] = await Promise.all([
      Prompt.find({ ...query, category: { $in: userInterests } })
        .sort({ score: -1, createdAt: -1 })
        .populate('category', 'name')
        .populate('author', 'name'),
      Prompt.find({ ...query, category: { $nin: userInterests } })
        .sort({ score: -1, createdAt: -1 })
        .populate('category', 'name')
        .populate('author', 'name'),
    ]);
    const all = [...interested, ...others];
    const total = all.length;
    prompts = all.slice(skip, skip + limit);
    return sendResponse(res, 200, 'Prompts fetched', {
      prompts,
      total,
      page,
      pages: Math.ceil(total / limit),
      isPersonalized: true,
    });
  }

  prompts = await Prompt.find(query)
    .sort({ score: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .populate('author', 'name');

  const total = await Prompt.countDocuments(query);

  sendResponse(res, 200, 'Prompts fetched', {
    prompts,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

exports.getPromptById = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id)
    .populate('category', 'name')
    .populate('author', 'name');
  
  if (!prompt || (prompt.status !== PROMPT_STATUS.APPROVED && (!req.user || req.user.role !== ROLES.ADMIN))) {
    return sendResponse(res, 404, 'Prompt not found');
  }

  // Increment views
  prompt.views += 1;
  prompt.score = scoreService.calculateScore(prompt);
  await prompt.save();

  // Check engagement for authenticated user
  let isLiked = false;
  let isSaved = false;
  if (req.user) {
    isLiked = !!(await Like.findOne({ promptId: prompt._id, userId: req.user._id }));
    isSaved = !!(await Save.findOne({ promptId: prompt._id, userId: req.user._id }));
  }

  sendResponse(res, 200, 'Prompt fetched', {
    ...prompt.toObject(),
    isLiked,
    isSaved,
  });
});

exports.createPrompt = asyncHandler(async (req, res) => {
  const { title, description, promptText, category, model } = req.body;
  
  if (!req.file) {
    return sendResponse(res, 400, 'Image is required for prompt creation');
  }

  const { url, publicId } = await imageService.uploadImage(req.file.buffer);
  const imageUrl = url;
  const imagePublicId = publicId;

  const status = req.user.role === ROLES.ADMIN ? PROMPT_STATUS.APPROVED : PROMPT_STATUS.PENDING;

  const prompt = await Prompt.create({
    title,
    description,
    promptText,
    category,
    model,
    author: req.user._id,
    imageUrl,
    imagePublicId,
    status,
  });

  // Calculate initial score
  prompt.score = scoreService.calculateScore(prompt);
  await prompt.save();

  sendResponse(res, 201, 'Prompt submitted successfully', prompt);

  // NOTIFICATION: Notify all admins of new submission
  if (status === PROMPT_STATUS.PENDING) {
    const admins = await User.find({ role: ROLES.ADMIN });
    const notificationData = admins.map(admin => ({
      recipient: admin._id,
      type: 'new_submission',
      promptId: prompt._id,
      actorName: req.user.name
    }));
    await Notification.insertMany(notificationData);
  }
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const promptId = req.params.id;
  const userId = req.user._id;

  const existingLike = await Like.findOne({ promptId, userId });
  const prompt = await Prompt.findById(promptId);

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    prompt.likes = Math.max(0, prompt.likes - 1);
  } else {
    await Like.create({ promptId, userId });
    prompt.likes += 1;
  }

  prompt.score = scoreService.calculateScore(prompt);
  await prompt.save();

  // NOTIFICATION: Notify author of like
  if (!existingLike && prompt.author.toString() !== userId.toString()) {
    await Notification.create({
      recipient: prompt.author,
      type: 'liked',
      promptId: promptId,
      actorName: req.user.name
    });
  }

  sendResponse(res, 200, existingLike ? 'Unliked' : 'Liked', { likes: prompt.likes });
});

exports.toggleSave = asyncHandler(async (req, res) => {
  const promptId = req.params.id;
  const userId = req.user._id;

  const existingSave = await Save.findOne({ promptId, userId });
  const prompt = await Prompt.findById(promptId);

  if (existingSave) {
    await Save.deleteOne({ _id: existingSave._id });
    prompt.saves = Math.max(0, prompt.saves - 1);
  } else {
    await Save.create({ promptId, userId });
    prompt.saves += 1;
  }

  await prompt.save();
  sendResponse(res, 200, existingSave ? 'Removed from saves' : 'Saved');
});

exports.getSavedPrompts = asyncHandler(async (req, res) => {
  const saves = await Save.find({ userId: req.user._id })
    .populate({
      path: 'promptId',
      populate: [{ path: 'category', select: 'name' }, { path: 'author', select: 'name' }],
    })
    .sort({ createdAt: -1 });

  const prompts = saves.map(s => s.promptId).filter(p => !!p);
  sendResponse(res, 200, 'Saved prompts fetched', prompts);
});

exports.getMyPrompts = asyncHandler(async (req, res) => {
  const { sort } = req.query;
  
  let sortQuery = { createdAt: -1 };
  if (sort === 'old') sortQuery = { createdAt: 1 };
  if (sort === 'relevance') sortQuery = { score: -1 };

  const prompts = await Prompt.find({ author: req.user._id })
    .sort(sortQuery)
    .populate('category', 'name')
    .populate('author', 'name');

  sendResponse(res, 200, 'My prompts fetched', prompts);
});

exports.updateMyPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');

  // Only owner or admin can update
  if (prompt.author.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    return sendResponse(res, 403, 'Not authorized to edit this prompt');
  }

  const { title, description, promptText, category, model } = req.body;
  if (title) prompt.title = title;
  if (description) prompt.description = description;
  if (promptText) prompt.promptText = promptText;
  if (category) prompt.category = category;
  if (model) prompt.model = model;

  // If new image uploaded
  if (req.file) {
    // Delete old image
    if (prompt.imagePublicId) {
      await imageService.deleteImage(prompt.imagePublicId);
    }
    const { url, publicId } = await imageService.uploadImage(req.file.buffer);
    prompt.imageUrl = url;
    prompt.imagePublicId = publicId;
  }

  // Reset to pending on edit (unless admin)
  if (req.user.role !== ROLES.ADMIN) {
    prompt.status = PROMPT_STATUS.PENDING;
  }

  prompt.score = scoreService.calculateScore(prompt);
  await prompt.save();

  sendResponse(res, 200, 'Prompt updated', prompt);
});

exports.deleteMyPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');

  // Only owner or admin can delete
  if (prompt.author.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
    return sendResponse(res, 403, 'Not authorized to delete this prompt');
  }

  // Clean up image
  if (prompt.imagePublicId) {
    await imageService.deleteImage(prompt.imagePublicId).catch(() => {});
  }

  await Prompt.deleteOne({ _id: prompt._id });
  sendResponse(res, 200, 'Prompt deleted');
});
