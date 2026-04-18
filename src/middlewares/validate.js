const { ZodError } = require('zod');
const sendResponse = require('../utils/apiResponse');

/**
 * Middleware to validate request data against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Validate body, query, and params as defined in schema
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace req data with parsed/sanitized data (Zod handles coercion/stripping)
    if (result.body) req.body = result.body;
    if (result.query) req.query = result.query;
    if (result.params) req.params = result.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return sendResponse(res, 400, `Validation Error: ${message}`);
    }
    next(error);
  }
};

module.exports = validate;
