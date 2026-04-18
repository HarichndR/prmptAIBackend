const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');

const router = express.Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
router.put('/:id', requireAuth, requireAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);

module.exports = router;

