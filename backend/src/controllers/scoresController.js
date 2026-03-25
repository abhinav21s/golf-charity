/**
 * Scores Controller
 * Manages golf score entry and retrieval (Stableford format)
 * Maximum 5 scores per user - rolling window
 */

const { supabaseAdmin } = require('../config/database');

/**
 * Get user's scores
 * GET /api/scores
 */
const getScores = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's scores ordered by date (most recent first)
    const { data: scores, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: scores || []
    });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scores'
    });
  }
};

/**
 * Add new score
 * POST /api/scores
 * Automatically maintains maximum of 5 scores (removes oldest if needed)
 */
const addScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, date } = req.body;

    // Validate score range (Stableford: 1-45)
    if (score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45 (Stableford format)'
      });
    }

    // Validate date is not in the future
    const scoreDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (scoreDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Score date cannot be in the future'
      });
    }

    // Get current scores count
    const { data: existingScores, error: countError } = await supabaseAdmin
      .from('scores')
      .select('id, score_date')
      .eq('user_id', userId)
      .order('score_date', { ascending: true }); // Oldest first for deletion

    if (countError) {
      throw countError;
    }

    // If user already has 5 scores, delete the oldest one
    if (existingScores && existingScores.length >= 5) {
      const oldestScore = existingScores[0];
      
      const { error: deleteError } = await supabaseAdmin
        .from('scores')
        .delete()
        .eq('id', oldestScore.id);

      if (deleteError) {
        throw deleteError;
      }

      console.log(`Deleted oldest score for user ${userId} to maintain 5-score limit`);
    }

    // Insert new score
    const { data: newScore, error: insertError } = await supabaseAdmin
      .from('scores')
      .insert([
        {
          user_id: userId,
          score: score,
          score_date: date
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Get updated scores list
    const { data: updatedScores } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5);

    res.status(201).json({
      success: true,
      message: 'Score added successfully',
      data: {
        newScore,
        allScores: updatedScores
      }
    });
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add score'
    });
  }
};

/**
 * Update existing score
 * PUT /api/scores/:scoreId
 */
const updateScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scoreId } = req.params;
    const { score, date } = req.body;

    // Validate score range
    if (score && (score < 1 || score > 45)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 45 (Stableford format)'
      });
    }

    // Validate date if provided
    if (date) {
      const scoreDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (scoreDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Score date cannot be in the future'
        });
      }
    }

    // Verify score belongs to user
    const { data: existingScore } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('id', scoreId)
      .eq('user_id', userId)
      .single();

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }

    // Update score
    const updateData = {};
    if (score) updateData.score = score;
    if (date) updateData.score_date = date;

    const { data: updatedScore, error } = await supabaseAdmin
      .from('scores')
      .update(updateData)
      .eq('id', scoreId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Score updated successfully',
      data: updatedScore
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update score'
    });
  }
};

/**
 * Delete score
 * DELETE /api/scores/:scoreId
 */
const deleteScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scoreId } = req.params;

    // Verify score belongs to user
    const { data: existingScore } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('id', scoreId)
      .eq('user_id', userId)
      .single();

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }

    // Delete score
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Score deleted successfully'
    });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete score'
    });
  }
};

/**
 * Get score statistics for user
 * GET /api/scores/stats
 */
const getScoreStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user scores
    const { data: scores, error } = await supabaseAdmin
      .from('scores')
      .select('score')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (!scores || scores.length === 0) {
      return res.json({
        success: true,
        data: {
          totalScores: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0
        }
      });
    }

    // Calculate statistics
    const scoreValues = scores.map(s => s.score);
    const totalScores = scoreValues.length;
    const averageScore = scoreValues.reduce((a, b) => a + b, 0) / totalScores;
    const highestScore = Math.max(...scoreValues);
    const lowestScore = Math.min(...scoreValues);

    res.json({
      success: true,
      data: {
        totalScores,
        averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
        highestScore,
        lowestScore
      }
    });
  } catch (error) {
    console.error('Get score stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch score statistics'
    });
  }
};

module.exports = {
  getScores,
  addScore,
  updateScore,
  deleteScore,
  getScoreStats
};
