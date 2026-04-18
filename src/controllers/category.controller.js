const Category = require('../models/Category.model');
const Prompt = require('../models/Prompt.model');
const imageService = require('../services/image.service');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  sendResponse(res, 200, 'Categories fetched', categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  
  const category = await Category.create({ name, slug });
  sendResponse(res, 201, 'Category created', category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  
  const category = await Category.findByIdAndUpdate(req.params.id, { name, slug }, { new: true, runValidators: true });
  if (!category) return sendResponse(res, 404, 'Category not found');

  sendResponse(res, 200, 'Category updated', category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return sendResponse(res, 404, 'Category not found');

  // Find all prompts in this category
  const prompts = await Prompt.find({ category: req.params.id });
  
  // Cleanup each prompt (images + DB record)
  for (const prompt of prompts) {
    if (prompt.imagePublicId) {
      await imageService.deleteImage(prompt.imagePublicId).catch(() => {});
    }
  }
  
  await Prompt.deleteMany({ category: req.params.id });
  await Category.findByIdAndDelete(req.params.id);
  
  sendResponse(res, 200, 'Category and all associated prompts deleted');
});

