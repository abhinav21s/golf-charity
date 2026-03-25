/**
 * Stripe Configuration
 * Payment processing setup
 */

const Stripe = require('stripe');
require('dotenv').config();

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Subscription plan configuration (INR only)
const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    interval: 'month',
    name: 'Monthly Subscription',
    currency: 'INR'
  },
  YEARLY: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    interval: 'year',
    name: 'Yearly Subscription',
    currency: 'INR'
  }
};

module.exports = {
  stripe,
  SUBSCRIPTION_PLANS
};
