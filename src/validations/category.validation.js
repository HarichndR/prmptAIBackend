const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(30),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(30),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
