const mongoose = require('mongoose');
const { PROMPT_STATUS } = require('../constants');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  promptText: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: [PROMPT_STATUS.PENDING, PROMPT_STATUS.APPROVED],
    default: PROMPT_STATUS.PENDING,
  },
  likes: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

promptSchema.index({ status: 1, score: -1 });
promptSchema.index({ category: 1, status: 1, score: -1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Prompt', promptSchema);
