/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/database');
const { sendEmail } = require('../config/email');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Golf Charity Platform',
      html: `
        <h1>Welcome ${firstName}!</h1>
        <p>Thank you for joining Golf Charity Platform.</p>
        <p>You're now part of a community that combines golf passion with charitable giving.</p>
        <p>Next steps:</p>
        <ul>
          <li>Choose your subscription plan</li>
          <li>Select a charity to support</li>
          <li>Enter your golf scores</li>
          <li>Participate in monthly draws</li>
        </ul>
        <p>Let's make a difference together!</p>
      `,
      text: `Welcome ${firstName}! Thank you for joining Golf Charity Platform.`
    });

    // Return user data (excluding password)
    const { password_hash, ...userData } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Get user's subscription status
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Return user data (excluding password)
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        hasActiveSubscription: !!subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get subscription status
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Get selected charity
    const { data: userCharity } = await supabaseAdmin
      .from('user_charities')
      .select(`
        *,
        charities (
          id,
          name,
          logo_url
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    // Return user data (excluding password)
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      data: {
        user: userData,
        subscription,
        charity: userCharity
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    const { password_hash, ...userData } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
