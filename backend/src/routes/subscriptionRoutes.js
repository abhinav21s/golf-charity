/**
 * Subscription Routes
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

// Protected routes
router.post('/create-checkout', authenticate, subscriptionController.createCheckoutSession);
router.get('/my-subscription', authenticate, subscriptionController.getMySubscription);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);

// Webhook route (no authentication - verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

module.exports = router;
