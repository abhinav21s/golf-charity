/**
 * Admin Routes
 * Admin-specific endpoints for platform management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/count', adminController.getUsersCount);
router.get('/users/:userId/scores', adminController.getUserScores);

// Subscription stats
router.get('/subscriptions/active-count', adminController.getActiveSubscriptionsCount);

// Draw stats
router.get('/draws/total-prize-pool', adminController.getTotalPrizePool);

// Charity stats
router.get('/charities/total-contributions', adminController.getTotalCharityContributions);

// Winner stats
router.get('/winners/pending-verifications', adminController.getPendingVerificationsCount);
router.get('/winners/pending-payments', adminController.getPendingPaymentsCount);

module.exports = router;
