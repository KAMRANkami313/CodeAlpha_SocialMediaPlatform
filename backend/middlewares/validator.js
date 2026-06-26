const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePost = [
  body('caption')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Caption cannot exceed 500 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  handleValidationErrors
];

const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Comment must be between 1 and 200 characters'),
  handleValidationErrors
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePost,
  validateComment
};