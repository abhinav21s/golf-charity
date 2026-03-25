/**
 * Charity Controller
 * Manages charity listings, user charity selection, and contributions
 */

const { supabaseAdmin } = require('../config/database');

/**
 * Get all active charities
 * GET /api/charities
 */
const getCharities = async (req, res) => {
  try {
    const { featured, search } = req.query;

    let query = supabaseAdmin
      .from('charities')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: charities, error } = await query;

    if (error) {
      console.error('Get charities database error:', error);
      throw error;
    }

    res.json(charities || []);
  } catch (error) {
    console.error('Get charities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charities'
    });
  }
};

/**
 * Get charity by ID with events
 * GET /api/charities/:charityId
 */
const getCharityById = async (req, res) => {
  try {
    const { charityId } = req.params;

    const { data: charity, error } = await supabaseAdmin
      .from('charities')
      .select(`
        *,
        charity_events (
          id,
          title,
          description,
          event_date,
          location,
          image_url
        )
      `)
      .eq('id', charityId)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Get charity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charity details'
    });
  }
};

/**
 * Select charity for user
 * POST /api/charities/select
 */
const selectCharity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { charityId, contributionPercentage = 10 } = req.body;

    // Validate contribution percentage
    if (contributionPercentage < 10 || contributionPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Contribution percentage must be between 10 and 100'
      });
    }

    // Verify charity exists
    const { data: charity } = await supabaseAdmin
      .from('charities')
      .select('id, name')
      .eq('id', charityId)
      .eq('status', 'active')
      .single();

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    // Deactivate any existing charity selections
    await supabaseAdmin
      .from('user_charities')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Check if user already has this charity
    const { data: existing } = await supabaseAdmin
      .from('user_charities')
      .select('id')
      .eq('user_id', userId)
      .eq('charity_id', charityId)
      .single();

    let result;

    if (existing) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from('user_charities')
        .update({
          is_active: true,
          contribution_percentage: contributionPercentage
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabaseAdmin
        .from('user_charities')
        .insert([
          {
            user_id: userId,
            charity_id: charityId,
            contribution_percentage: contributionPercentage,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      message: `Charity selected: ${charity.name}`,
      data: result
    });
  } catch (error) {
    console.error('Select charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select charity'
    });
  }
};

/**
 * Get user's selected charity
 * GET /api/charities/my-charity
 */
const getMyCharity = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: userCharity, error } = await supabaseAdmin
      .from('user_charities')
      .select(`
        *,
        charities (
          id,
          name,
          description,
          logo_url,
          website_url
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      data: userCharity || null
    });
  } catch (error) {
    console.error('Get my charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch selected charity'
    });
  }
};

/**
 * Get user's contribution history
 * GET /api/charities/my-contributions
 */
const getMyContributions = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: contributions, error } = await supabaseAdmin
      .from('charity_contributions')
      .select(`
        *,
        charities (
          name,
          logo_url
        )
      `)
      .eq('user_id', userId)
      .order('contribution_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate total contributed
    const totalContributed = contributions?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;

    res.json({
      success: true,
      data: {
        contributions: contributions || [],
        totalContributed: parseFloat(totalContributed.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contribution history'
    });
  }
};

/**
 * Create charity (Admin only)
 * POST /api/charities/admin/create
 */
const createCharity = async (req, res) => {
  try {
    const { name, description, logoUrl, websiteUrl, contactEmail, isFeatured } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const { data: newCharity, error } = await supabaseAdmin
      .from('charities')
      .insert([
        {
          name,
          description,
          logo_url: logoUrl || null,
          website_url: websiteUrl || null,
          contact_email: contactEmail || null,
          is_featured: isFeatured || false,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error creating charity:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Charity created successfully',
      data: newCharity
    });
  } catch (error) {
    console.error('Create charity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create charity'
    });
  }
};

/**
 * Update charity (Admin only)
 * PUT /api/charities/:charityId
 */
const updateCharity = async (req, res) => {
  try {
    const { charityId } = req.params;
    const { name, description, logoUrl, websiteUrl, contactEmail, isFeatured, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (logoUrl) updateData.logo_url = logoUrl;
    if (websiteUrl) updateData.website_url = websiteUrl;
    if (contactEmail) updateData.contact_email = contactEmail;
    if (typeof isFeatured !== 'undefined') updateData.is_featured = isFeatured;
    if (status) updateData.status = status;

    const { data: updatedCharity, error } = await supabaseAdmin
      .from('charities')
      .update(updateData)
      .eq('id', charityId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Charity updated successfully',
      data: updatedCharity
    });
  } catch (error) {
    console.error('Update charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update charity'
    });
  }
};

/**
 * Delete charity (Admin only)
 * DELETE /api/charities/:charityId
 */
const deleteCharity = async (req, res) => {
  try {
    const { charityId } = req.params;

    // Soft delete by setting status to inactive
    const { error } = await supabaseAdmin
      .from('charities')
      .update({ status: 'inactive' })
      .eq('id', charityId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Charity deleted successfully'
    });
  } catch (error) {
    console.error('Delete charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete charity'
    });
  }
};

/**
 * Get charity statistics (Admin only)
 * GET /api/charities/stats
 */
const getCharityStats = async (req, res) => {
  try {
    // Get contribution summary from view
    const { data: stats, error } = await supabaseAdmin
      .from('charity_contribution_summary')
      .select('*')
      .order('total_received', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: stats || []
    });
  } catch (error) {
    console.error('Get charity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charity statistics'
    });
  }
};

module.exports = {
  getCharities,
  getCharityById,
  selectCharity,
  getMyCharity,
  getMyContributions,
  createCharity,
  updateCharity,
  deleteCharity,
  getCharityStats
};
