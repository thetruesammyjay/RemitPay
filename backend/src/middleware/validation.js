const { validationResult, body, param, query } = require('express-validator');
const { isValidPublicKey, isValidEmail, isValidPassword, isValidAmount, isValidMemo } = require('../utils/validators');

/**
 * Check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .custom(isValidEmail).withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .custom(isValidPassword).withMessage('Password must contain uppercase, lowercase, and number'),
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .custom(isValidPublicKey).withMessage('Invalid Solana wallet address'),
  validate,
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

/**
 * Validation rules for sending transaction
 */
const validateSendTransaction = [
  body('recipientWallet')
    .trim()
    .notEmpty().withMessage('Recipient wallet is required')
    .custom(isValidPublicKey).withMessage('Invalid recipient wallet address'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .custom(isValidAmount).withMessage('Amount must be a positive number'),
  body('memo')
    .optional()
    .trim()
    .custom(isValidMemo).withMessage('Memo must be 200 characters or less'),
  validate,
];

/**
 * Validation rules for creating recipient
 */
const validateCreateRecipient = [
  body('name')
    .trim()
    .notEmpty().withMessage('Recipient name is required')
    .isLength({ max: 255 }).withMessage('Name must be 255 characters or less'),
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .custom(isValidPublicKey).withMessage('Invalid Solana wallet address'),
  validate,
];

/**
 * Validation rules for updating recipient
 */
const validateUpdateRecipient = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 255 }).withMessage('Name must be 255 characters or less'),
  body('walletAddress')
    .optional()
    .trim()
    .notEmpty().withMessage('Wallet address cannot be empty')
    .custom(isValidPublicKey).withMessage('Invalid Solana wallet address'),
  validate,
];

/**
 * Validation rules for wallet connection
 */
const validateWalletConnect = [
  body('walletAddress')
    .trim()
    .notEmpty().withMessage('Wallet address is required')
    .custom(isValidPublicKey).withMessage('Invalid Solana wallet address'),
  validate,
];

/**
 * Validation rules for transaction ID parameter
 */
const validateTransactionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid transaction ID'),
  validate,
];

/**
 * Validation rules for recipient ID parameter
 */
const validateRecipientId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid recipient ID'),
  validate,
];

/**
 * Validation rules for pagination query
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

/**
 * Validation rules for transaction status query
 */
const validateTransactionStatus = [
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled', 'failed']).withMessage('Invalid status'),
  validate,
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateSendTransaction,
  validateCreateRecipient,
  validateUpdateRecipient,
  validateWalletConnect,
  validateTransactionId,
  validateRecipientId,
  validatePagination,
  validateTransactionStatus,
};