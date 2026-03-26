/**
 * Draw Controller
 * Manages monthly draws, prize pools, and winner determination
 * Prize Pool Distribution: 5-match (40%), 4-match (35%), 3-match (25%)
 */

const { supabaseAdmin } = require('../config/database');
const { sendEmail } = require('../config/email');

/**
 * Generate random draw numbers (1-45)
 * @returns {Array} Array of 5 unique random numbers
 */
const generateRandomNumbers = () => {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

/**
 * Generate algorithmic draw numbers based on user scores
 * Weighted by most/least frequent scores
 * @param {string} weightType - 'most_frequent' or 'least_frequent'
 * @returns {Array} Array of 5 numbers
 */
const generateAlgorithmicNumbers = async (weightType = 'most_frequent') => {
  try {
    // Get all scores from active subscribers
    const { data: scores } = await supabaseAdmin
      .from('scores')
      .select('score, user_id')
      .order('created_at', { ascending: false });

    if (!scores || scores.length === 0) {
      // Fallback to random if no scores
      return generateRandomNumbers();
    }

    // Count frequency of each score
    const frequency = {};
    scores.forEach(s => {
      frequency[s.score] = (frequency[s.score] || 0) + 1;
    });

    // Sort by frequency
    const sortedScores = Object.entries(frequency)
      .sort((a, b) => {
        return weightType === 'most_frequent' 
          ? b[1] - a[1]  // Most frequent first
          : a[1] - b[1]; // Least frequent first
      })
      .map(entry => parseInt(entry[0]));

    // Select 5 numbers from weighted list
    const selectedNumbers = [];
    let index = 0;
    
    while (selectedNumbers.length < 5 && index < sortedScores.length) {
      const num = sortedScores[index];
      if (!selectedNumbers.includes(num)) {
        selectedNumbers.push(num);
      }
      index++;
    }

    // Fill remaining with random if needed
    while (selectedNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!selectedNumbers.includes(num)) {
        selectedNumbers.push(num);
      }
    }

    return selectedNumbers.sort((a, b) => a - b);
  } catch (error) {
    console.error('Algorithmic number generation error:', error);
    return generateRandomNumbers();
  }
};

/**
 * Calculate total prize pool from active subscriptions
 * @param {number} month - Draw month
 * @param {number} year - Draw year
 * @returns {Object} Prize pool breakdown
 */
const calculatePrizePool = async (month, year) => {
  try {
    // Get all active subscriptions for the draw period
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('amount')
      .eq('status', 'active');

    if (!subscriptions || subscriptions.length === 0) {
      return {
        totalPool: 0,
        fiveMatchPool: 0,
        fourMatchPool: 0,
        threeMatchPool: 0
      };
    }

    // Calculate total pool (sum of all subscription amounts)
    const totalPool = subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

    // Distribute according to fixed percentages
    const fiveMatchPool = totalPool * 0.40;  // 40%
    const fourMatchPool = totalPool * 0.35;  // 35%
    const threeMatchPool = totalPool * 0.25; // 25%

    return {
      totalPool: parseFloat(totalPool.toFixed(2)),
      fiveMatchPool: parseFloat(fiveMatchPool.toFixed(2)),
      fourMatchPool: parseFloat(fourMatchPool.toFixed(2)),
      threeMatchPool: parseFloat(threeMatchPool.toFixed(2))
    };
  } catch (error) {
    console.error('Prize pool calculation error:', error);
    return {
      totalPool: 0,
      fiveMatchPool: 0,
      fourMatchPool: 0,
      threeMatchPool: 0
    };
  }
};

/**
 * Count matching numbers between two arrays
 * @param {Array} userNumbers - User's scores
 * @param {Array} drawNumbers - Winning numbers
 * @returns {number} Count of matches
 */
const countMatches = (userNumbers, drawNumbers) => {
  return userNumbers.filter(num => drawNumbers.includes(num)).length;
};

/**
 * Create or simulate a draw
 * POST /api/draws/create
 * Admin only
 */
const createDraw = async (req, res) => {
  try {
    const { month, year, drawType, simulate = false } = req.body;

    // Validate inputs
    if (!month || !year || !drawType) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, and draw type are required'
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    if (!['random', 'algorithmic'].includes(drawType)) {
      return res.status(400).json({
        success: false,
        message: 'Draw type must be random or algorithmic'
      });
    }

    // Check if draw already exists for this month/year
    const { data: existingDraw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('draw_month', month)
      .eq('draw_year', year)
      .single();

    if (existingDraw && !simulate) {
      return res.status(400).json({
        success: false,
        message: 'Draw already exists for this month/year'
      });
    }

    // Generate winning numbers
    const winningNumbers = drawType === 'random' 
      ? generateRandomNumbers()
      : await generateAlgorithmicNumbers('most_frequent');

    // Calculate prize pools
    const prizePool = await calculatePrizePool(month, year);

    // Get previous month's jackpot if any
    const { data: previousDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_amount')
      .eq('draw_year', month === 1 ? year - 1 : year)
      .eq('draw_month', month === 1 ? 12 : month - 1)
      .eq('status', 'published')
      .single();

    const rolloverJackpot = previousDraw?.jackpot_amount || 0;
    const totalFiveMatchPool = prizePool.fiveMatchPool + rolloverJackpot;

    // Get all active subscribers with their scores
    const { data: activeUsers } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        user_id,
        users (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'active');

    if (!activeUsers || activeUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found for this draw'
      });
    }

    // Get scores for all active users
    const participants = [];
    const winners = {
      fiveMatch: [],
      fourMatch: [],
      threeMatch: []
    };

    console.log('Processing active users:', activeUsers.length);

    for (const sub of activeUsers) {
      const userId = sub.user_id;
      
      // Get user's latest 5 scores
      const { data: userScores } = await supabaseAdmin
        .from('scores')
        .select('score')
        .eq('user_id', userId)
        .order('score_date', { ascending: false })
        .limit(5);

      console.log(`User ${userId}: ${userScores?.length || 0} scores found`);

      if (userScores && userScores.length === 5) {
        const userNumbers = userScores.map(s => s.score).sort((a, b) => a - b);
        const matchCount = countMatches(userNumbers, winningNumbers);

        console.log(`User ${userId} numbers: [${userNumbers}], matches: ${matchCount}`);

        participants.push({
          user_id: userId,
          user_numbers: userNumbers,
          matches_count: matchCount
        });

        // Categorize winners
        if (matchCount === 5) {
          winners.fiveMatch.push({ userId, userNumbers });
        } else if (matchCount === 4) {
          winners.fourMatch.push({ userId, userNumbers });
        } else if (matchCount === 3) {
          winners.threeMatch.push({ userId, userNumbers });
        }
      }
    }

    console.log('Total participants:', participants.length);
    console.log('Winners:', {
      fiveMatch: winners.fiveMatch.length,
      fourMatch: winners.fourMatch.length,
      threeMatch: winners.threeMatch.length
    });

    // Calculate prize amounts per winner
    const fiveMatchPrize = winners.fiveMatch.length > 0 
      ? totalFiveMatchPool / winners.fiveMatch.length 
      : 0;
    const fourMatchPrize = winners.fourMatch.length > 0 
      ? prizePool.fourMatchPool / winners.fourMatch.length 
      : 0;
    const threeMatchPrize = winners.threeMatch.length > 0 
      ? prizePool.threeMatchPool / winners.threeMatch.length 
      : 0;

    // Determine jackpot rollover for next month
    const nextJackpot = winners.fiveMatch.length === 0 ? totalFiveMatchPool : 0;

    // Simulation mode - return preview without saving
    if (simulate) {
      return res.json({
        success: true,
        simulation: true,
        data: {
          month,
          year,
          drawType,
          winningNumbers,
          prizePool: {
            ...prizePool,
            rolloverJackpot,
            totalFiveMatchPool
          },
          participants: participants.length,
          winners: {
            fiveMatch: {
              count: winners.fiveMatch.length,
              prizePerWinner: parseFloat(fiveMatchPrize.toFixed(2))
            },
            fourMatch: {
              count: winners.fourMatch.length,
              prizePerWinner: parseFloat(fourMatchPrize.toFixed(2))
            },
            threeMatch: {
              count: winners.threeMatch.length,
              prizePerWinner: parseFloat(threeMatchPrize.toFixed(2))
            }
          },
          nextMonthJackpot: parseFloat(nextJackpot.toFixed(2))
        }
      });
    }

    // Create draw date (last day of the month)
    const drawDate = new Date(year, month, 0); // Day 0 = last day of previous month, so month without -1 gives last day of that month

    // Create draw record
    const { data: newDraw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert([
        {
          draw_month: month,
          draw_year: year,
          draw_date: drawDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          draw_type: drawType,
          status: 'published',
          winning_numbers: winningNumbers,
          total_pool_amount: prizePool.totalPool,
          jackpot_amount: nextJackpot,
          five_match_pool: totalFiveMatchPool,
          four_match_pool: prizePool.fourMatchPool,
          three_match_pool: prizePool.threeMatchPool,
          published_at: new Date()
        }
      ])
      .select()
      .single();

    if (drawError) {
      throw drawError;
    }

    // Save participants
    const participantRecords = participants.map(p => ({
      draw_id: newDraw.id,
      ...p
    }));

    if (participantRecords.length > 0) {
      const { error: participantError } = await supabaseAdmin
        .from('draw_participants')
        .insert(participantRecords);

      if (participantError) {
        console.error('Participant insert error:', participantError);
      }
    }

    // Save winners
    const winnerRecords = [];

    winners.fiveMatch.forEach(w => {
      winnerRecords.push({
        draw_id: newDraw.id,
        user_id: w.userId,
        match_type: '5-match',
        prize_amount: parseFloat(fiveMatchPrize.toFixed(2))
      });
    });

    winners.fourMatch.forEach(w => {
      winnerRecords.push({
        draw_id: newDraw.id,
        user_id: w.userId,
        match_type: '4-match',
        prize_amount: parseFloat(fourMatchPrize.toFixed(2))
      });
    });

    winners.threeMatch.forEach(w => {
      winnerRecords.push({
        draw_id: newDraw.id,
        user_id: w.userId,
        match_type: '3-match',
        prize_amount: parseFloat(threeMatchPrize.toFixed(2))
      });
    });

    if (winnerRecords.length > 0) {
      const { error: winnerError } = await supabaseAdmin
        .from('winners')
        .insert(winnerRecords);

      if (winnerError) {
        console.error('Winner insert error:', winnerError);
        throw winnerError;
      }

      // Send winner notification emails
      for (const winner of winnerRecords) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email, first_name')
          .eq('id', winner.user_id)
          .single();

        if (user) {
          await sendEmail({
            to: user.email,
            subject: `🎉 Congratulations! You're a Winner!`,
            html: `
              <h1>Congratulations, ${user.first_name}!</h1>
              <p>You've won in the ${month}/${year} draw!</p>
              <p><strong>Match Type:</strong> ${winner.match_type}</p>
              <p><strong>Prize Amount:</strong> $${winner.prize_amount.toFixed(2)}</p>
              <p><strong>Winning Numbers:</strong> ${winningNumbers.join(', ')}</p>
              <p>Please log in to your dashboard to upload proof of your scores for verification.</p>
              <p>Once verified, your prize will be processed.</p>
            `,
            text: `Congratulations! You won $${winner.prize_amount.toFixed(2)} in the ${month}/${year} draw!`
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Draw created and published successfully',
      data: {
        draw: newDraw,
        participants: participants.length,
        winners: {
          fiveMatch: winners.fiveMatch.length,
          fourMatch: winners.fourMatch.length,
          threeMatch: winners.threeMatch.length
        }
      }
    });
  } catch (error) {
    console.error('Create draw error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create draw'
    });
  }
};

/**
 * Get all draws
 * GET /api/draws
 */
const getDraws = async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;

    let query = supabaseAdmin
      .from('draws')
      .select('*')
      .order('draw_year', { ascending: false })
      .order('draw_month', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    const { data: draws, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: draws || []
    });
  } catch (error) {
    console.error('Get draws error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch draws'
    });
  }
};

/**
 * Get draw by ID with participants and winners
 * GET /api/draws/:drawId
 */
const getDrawById = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        draw_participants (
          user_id,
          user_numbers,
          matches_count,
          users (
            first_name,
            last_name,
            email
          )
        ),
        winners (
          id,
          user_id,
          match_type,
          prize_amount,
          verification_status,
          payment_status,
          users (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', drawId)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: draw
    });
  } catch (error) {
    console.error('Get draw by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch draw details'
    });
  }
};

/**
 * Get user's draw participation history
 * GET /api/draws/my-participation
 */
const getMyParticipation = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: participation, error } = await supabaseAdmin
      .from('draw_participants')
      .select(`
        *,
        draws (
          draw_month,
          draw_year,
          winning_numbers,
          status,
          published_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: participation || []
    });
  } catch (error) {
    console.error('Get participation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participation history'
    });
  }
};

module.exports = {
  createDraw,
  getDraws,
  getDrawById,
  getMyParticipation
};
