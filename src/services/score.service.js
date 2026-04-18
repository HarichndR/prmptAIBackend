const Prompt = require('../models/Prompt.model');

const calculateScore = (prompt) => {
  const engagementScore = (prompt.likes * 2) + (prompt.commentsCount * 3) + (prompt.views * 1);
  
  const now = new Date();
  const ageInDays = (now - prompt.createdAt) / (24 * 60 * 60 * 1000);
  const freshnessBoost = 1 / (1 + ageInDays / 7); // halves every 7 days

  return engagementScore + (freshnessBoost * 20);
};

exports.calculateScore = calculateScore;

exports.updatePromptScore = async (promptId) => {
  const prompt = await Prompt.findById(promptId);
  if (!prompt) return;

  prompt.score = calculateScore(prompt);
  await prompt.save();
};

