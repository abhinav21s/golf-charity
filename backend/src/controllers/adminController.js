/**
 * Admin Controller
 * Admin-specific endpoints for platform management
 */

const { supabaseAdmin } = require('../config/database');

/**
 * Get all users
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, status, created_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Get subscriptions for all users
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan_type, status')
      .eq('status', 'active');

    if (subsError) throw subsError;

    // Map subscriptions to users
    const subscriptionMap = {};
    (subscriptions || []).forEach(sub => {
      subscriptionMap[sub.user_id] = sub;
    });

    // Format user data with subscription info
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      subscription_status: subscriptionMap[user.id]?.status || null,
      subscription_plan: subscriptionMap[user.id]?.plan_type || null
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

/**
 * Get total users count
 * GET /api/admin/users/count
 */
const getUsersCount = async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get users count error:', error);
    res.status(500).json({ count: 0 });
  }
};

/**
 * Get user scores
 * GET /api/admin/users/:userId/scores
 */
const getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: scores, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false });

    if (error) throw error;

    res.json(scores || []);
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json([]);
  }
};

/**
 * Get active subscriptions count
 * GET /api/admin/subscriptions/active-count
 */
const getActiveSubscriptionsCount = async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get active subscriptions count error:', error);
    res.status(500).json({ count: 0 });
  }
};

/**
 * Get total prize pool
 * GET /api/admin/draws/total-prize-pool
 */
const getTotalPrizePool = async (req, res) => {
  try {
    const { data: draws, error } = await supabaseAdmin
      .from('draws')
      .select('total_prize_pool')
      .eq('status', 'published');

    if (error) throw error;

    const total = (draws || []).reduce((sum, draw) => sum + (draw.total_prize_pool || 0), 0);

    res.json({ total });
  } catch (error) {
    console.error('Get total prize pool error:', error);
    res.status(500).json({ total: 0 });
  }
};

/**
 * Get total charity contributions
 * GET /api/admin/charities/total-contributions
 */
const getTotalCharityContributions = async (req, res) => {
  try {
    const { data: contributions, error } = await supabaseAdmin
      .from('charity_contributions')
      .select('amount');

    if (error) throw error;

    const total = (contributions || []).reduce((sum, c) => sum + (c.amount || 0), 0);

    res.json({ total });
  } catch (error) {
    console.error('Get total charity contributions error:', error);
    res.status(500).json({ total: 0 });
  }
};

/**
 * Get pending verifications count
 * GET /api/admin/winners/pending-verifications
 */
const getPendingVerificationsCount = async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get pending verifications count error:', error);
    res.status(500).json({ count: 0 });
  }
};

/**
 * Get pending payments count
 * GET /api/admin/winners/pending-payments
 */
const getPendingPaymentsCount = async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'approved')
      .eq('payment_status', 'pending');

    if (error) throw error;

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get pending payments count error:', error);
    res.status(500).json({ count: 0 });
  }
};

module.exports = {
  getAllUsers,
  getUsersCount,
  getUserScores,
  getActiveSubscriptionsCount,
  getTotalPrizePool,
  getTotalCharityContributions,
  getPendingVerificationsCount,
  getPendingPaymentsCount
};
