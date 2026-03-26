/**
 * Validation Middleware
 * Request data validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * User registration validation
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  handleValidationErrors
];

/**
 * Login validation
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Score entry validation
 */
const validateScore = [
  body('score')
    .isInt({ min: 1, max: 45 })
    .withMessage('Score must be between 1 and 45'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .custom((value) => {
      const scoreDate = new Date(value);
      const today = new Date();
      if (scoreDate > today) {
        throw new Error('Score date cannot be in the future');
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Charity selection validation
 */
const validateCharitySelection = [
  body('charityId')
    .isUUID()
    .withMessage('Valid charity ID is required'),
  body('contributionPercentage')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Contribution percentage must be between 10 and 100'),
  handleValidationErrors
];

/**
 * Draw configuration validation
 */
const validateDrawConfig = [
  body('drawType')
    .isIn(['random', 'algorithmic'])
    .withMessage('Draw type must be random or algorithmic'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2024 })
    .withMessage('Year must be 2024 or later'),
  handleValidationErrors
];

/**
 * Winner verification validation
 */
const validateWinnerVerification = [
  param('winnerId')
    .isUUID()
    .withMessage('Valid winner ID is required'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateScore,
  validateCharitySelection,
  validateDrawConfig,
  validateWinnerVerification,
  handleValidationErrors
};
