/**
 * Subscription Controller
 * Handles subscription creation, management, and Stripe integration
 */

const { stripe, SUBSCRIPTION_PLANS } = require('../config/stripe');
const { supabaseAdmin } = require('../config/database');
const { sendEmail } = require('../config/email');

/**
 * Create Stripe checkout session for subscription
 * POST /api/subscriptions/create-checkout
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { planType, currency = 'INR' } = req.body; // 'monthly' or 'yearly', currency defaults to INR
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Validate plan type
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be monthly or yearly.'
      });
    }

    // Validate currency (only INR supported)
    if (currency !== 'INR') {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Only INR is supported.'
      });
    }

    // Get or create Stripe customer
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let stripeCustomerId = userData?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // Get price ID based on plan type
    const priceId = planType === 'monthly' 
      ? SUBSCRIPTION_PLANS.MONTHLY.priceId 
      : SUBSCRIPTION_PLANS.YEARLY.priceId;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
};

/**
 * Handle Stripe webhook events
 * POST /api/subscriptions/webhook
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful checkout completion
 */
const handleCheckoutCompleted = async (session) => {
  const userId = session.metadata.userId;
  const planType = session.metadata.planType;

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Calculate charity contribution (10% minimum)
  const subscriptionAmount = subscription.items.data[0].price.unit_amount / 100;
  const charityPercentage = 10; // Default minimum

  // Get user's selected charity
  const { data: userCharity } = await supabaseAdmin
    .from('user_charities')
    .select('charity_id, contribution_percentage')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  const actualCharityPercentage = userCharity?.contribution_percentage || charityPercentage;
  const charityAmount = (subscriptionAmount * actualCharityPercentage) / 100;

  // Create subscription record
  const { data: newSubscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .insert([
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        plan_type: planType,
        status: 'active',
        amount: subscriptionAmount,
        currency: subscription.currency.toUpperCase(),
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      }
    ])
    .select()
    .single();

  if (subError) {
    console.error('Failed to create subscription record:', subError);
    return;
  }

  // Record charity contribution
  if (userCharity) {
    await supabaseAdmin
      .from('charity_contributions')
      .insert([
        {
          user_id: userId,
          charity_id: userCharity.charity_id,
          subscription_id: newSubscription.id,
          amount: charityAmount,
          contribution_percentage: actualCharityPercentage
        }
      ]);

    // Update charity total
    await supabaseAdmin.rpc('increment_charity_total', {
      charity_id: userCharity.charity_id,
      amount: charityAmount
    });
  }

  // Get user email
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, first_name')
    .eq('id', userId)
    .single();

  // Send confirmation email
  if (user) {
    await sendEmail({
      to: user.email,
      subject: 'Subscription Activated - Welcome to Golf Charity Platform',
      html: `
        <h1>Welcome aboard, ${user.first_name}!</h1>
        <p>Your ${planType} subscription is now active.</p>
        <p><strong>Subscription Details:</strong></p>
        <ul>
          <li>Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}</li>
          <li>Amount: $${subscriptionAmount.toFixed(2)}</li>
          <li>Charity Contribution: $${charityAmount.toFixed(2)} (${actualCharityPercentage}%)</li>
          <li>Next Billing: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</li>
        </ul>
        <p>You can now:</p>
        <ul>
          <li>Enter your golf scores</li>
          <li>Participate in monthly draws</li>
          <li>Track your charitable impact</li>
        </ul>
        <p>Good luck in the draws!</p>
      `,
      text: `Welcome! Your ${planType} subscription is now active.`
    });
  }
};

/**
 * Handle subscription update
 */
const handleSubscriptionUpdated = async (subscription) => {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);
};

/**
 * Handle subscription deletion/cancellation
 */
const handleSubscriptionDeleted = async (subscription) => {
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled'
    })
    .eq('stripe_subscription_id', subscription.id);

  // Get user email for notification
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, users(email, first_name)')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (sub?.users) {
    await sendEmail({
      to: sub.users.email,
      subject: 'Subscription Cancelled',
      html: `
        <h1>We're sorry to see you go, ${sub.users.first_name}</h1>
        <p>Your subscription has been cancelled.</p>
        <p>You'll continue to have access until the end of your current billing period.</p>
        <p>We hope to see you back soon!</p>
      `,
      text: `Your subscription has been cancelled.`
    });
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (invoice) => {
  // Payment succeeded - subscription renewed
  console.log('Payment succeeded for invoice:', invoice.id);
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (invoice) => {
  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);

  console.log('Payment failed for invoice:', invoice.id);
};

/**
 * Get user's subscription details
 * GET /api/subscriptions/my-subscription
 */
const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      data: subscription || null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
};

/**
 * Cancel subscription
 * POST /api/subscriptions/cancel
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe (at period end)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update local record
    await supabaseAdmin
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription.id);

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getMySubscription,
  cancelSubscription
};
