const { z } = require('zod');

const createPromptSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    promptText: z.string().min(10, 'Prompt text must be at least 10 characters'),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    model: z.string().min(1, 'AI Model is required'),
  }),
});

const updatePromptSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid prompt ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(10).optional(),
    promptText: z.string().min(10).optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    model: z.string().min(1).optional(),
  }),
});

const getPromptsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    sort: z.enum(['new', 'old', 'relevance']).optional(),
  }),
});

module.exports = {
  createPromptSchema,
  updatePromptSchema,
  getPromptsSchema,
};
