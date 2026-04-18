const Comment = require('../models/Comment.model');
const Prompt = require('../models/Prompt.model');
const scoreService = require('../services/score.service');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const Notification = require('../models/Notification.model');

exports.getComments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ promptId: req.params.promptId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name');

  const total = await Comment.countDocuments({ promptId: req.params.promptId });

  sendResponse(res, 200, 'Comments fetched', {
    comments,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

exports.postComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const promptId = req.params.promptId;

  const prompt = await Prompt.findById(promptId);
  if (!prompt) return sendResponse(res, 404, 'Prompt not found');

  const comment = await Comment.create({
    promptId,
    author: req.user._id,
    text,
  });

  prompt.commentsCount = (prompt.commentsCount || 0) + 1;
  prompt.score = scoreService.calculateScore(prompt);
  await prompt.save();

  // NOTIFICATION: Notify author of comment
  if (prompt.author.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: prompt.author,
      type: 'commented',
      promptId: promptId,
      actorName: req.user.name
    });
  }

  // Populate author before returning to avoid frontend crashes
  const populatedComment = await Comment.findById(comment._id).populate('author', 'name');

  sendResponse(res, 201, 'Comment posted', populatedComment);
});
