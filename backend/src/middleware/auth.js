/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Check if user has active subscription
 */
const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's subscription status
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this resource.'
      });
    }

    // Check if subscription is not expired
    const currentDate = new Date();
    const endDate = new Date(subscription.current_period_end);

    if (currentDate > endDate) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired. Please renew to continue.'
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription status.'
    });
  }
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireSubscription,
  requireAdmin
};
