/**
 * Winners Controller
 * Manages winner verification, proof upload, and payment tracking
 */

const { supabaseAdmin } = require('../config/database');
const { sendEmail } = require('../config/email');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * Get user's winnings
 * GET /api/winners/my-winnings
 */
const getMyWinnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: winnings, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        draws (
          draw_month,
          draw_year,
          winning_numbers
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate total winnings
    const totalWon = winnings?.reduce((sum, w) => sum + parseFloat(w.prize_amount), 0) || 0;
    const totalPaid = winnings?.filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + parseFloat(w.prize_amount), 0) || 0;

    res.json({
      success: true,
      data: {
        winnings: winnings || [],
        totalWon: parseFloat(totalWon.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        pending: parseFloat((totalWon - totalPaid).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get my winnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch winnings'
    });
  }
};

/**
 * Upload proof of scores
 * POST /api/winners/:winnerId/upload-proof
 */
const uploadProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { winnerId } = req.params;

    // Verify winner belongs to user
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .eq('user_id', userId)
      .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner record not found'
      });
    }

    if (winner.verification_status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Proof already approved'
      });
    }

    // File should be uploaded via multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No proof image uploaded'
      });
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, store local path
    const proofUrl = `/uploads/${req.file.filename}`;

    // Update winner record
    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from('winners')
      .update({
        proof_image_url: proofUrl,
        verification_status: 'pending'
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Proof uploaded successfully. Awaiting admin verification.',
      data: updatedWinner
    });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload proof'
    });
  }
};

/**
 * Get all winners (Admin only)
 * GET /api/winners
 */
const getAllWinners = async (req, res) => {
  try {
    const { verificationStatus, paymentStatus, drawId } = req.query;

    let query = supabaseAdmin
      .from('winners')
      .select(`
        *,
        users (
          first_name,
          last_name,
          email
        ),
        draws (
          draw_month,
          draw_year,
          winning_numbers
        )
      `)
      .order('created_at', { ascending: false });

    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (drawId) {
      query = query.eq('draw_id', drawId);
    }

    const { data: winners, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: winners || []
    });
  } catch (error) {
    console.error('Get all winners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch winners'
    });
  }
};

/**
 * Verify winner (Admin only)
 * PUT /api/winners/:winnerId/verify
 */
const verifyWinner = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { status, notes } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    // Get winner details
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        users (
          email,
          first_name
        )
      `)
      .eq('id', winnerId)
      .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner not found'
      });
    }

    // Update verification status
    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from('winners')
      .update({
        verification_status: status,
        admin_notes: notes,
        verified_at: new Date()
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Send notification email
    if (winner.users) {
      const emailSubject = status === 'approved' 
        ? 'Winner Verification Approved' 
        : 'Winner Verification Update';
      
      const emailBody = status === 'approved'
        ? `
          <h1>Great news, ${winner.users.first_name}!</h1>
          <p>Your winner verification has been approved.</p>
          <p><strong>Prize Amount:</strong> $${winner.prize_amount.toFixed(2)}</p>
          <p>Your payment will be processed shortly.</p>
        `
        : `
          <h1>Winner Verification Update</h1>
          <p>Unfortunately, we couldn't verify your winning submission.</p>
          ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
          <p>Please contact support if you have questions.</p>
        `;

      await sendEmail({
        to: winner.users.email,
        subject: emailSubject,
        html: emailBody,
        text: `Winner verification ${status}`
      });
    }

    res.json({
      success: true,
      message: `Winner ${status} successfully`,
      data: updatedWinner
    });
  } catch (error) {
    console.error('Verify winner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify winner'
    });
  }
};

/**
 * Mark winner as paid (Admin only)
 * PUT /api/winners/:winnerId/mark-paid
 */
const markAsPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    // Get winner details
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        users (
          email,
          first_name
        )
      `)
      .eq('id', winnerId)
      .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner not found'
      });
    }

    if (winner.verification_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Winner must be verified before marking as paid'
      });
    }

    // Update payment status
    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from('winners')
      .update({
        payment_status: 'paid',
        paid_at: new Date()
      })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Send payment confirmation email
    if (winner.users) {
      await sendEmail({
        to: winner.users.email,
        subject: 'Prize Payment Processed',
        html: `
          <h1>Payment Processed, ${winner.users.first_name}!</h1>
          <p>Your prize payment has been processed.</p>
          <p><strong>Amount:</strong> $${winner.prize_amount.toFixed(2)}</p>
          <p>You should receive the funds within 3-5 business days.</p>
          <p>Thank you for being part of Golf Charity Platform!</p>
        `,
        text: `Your prize payment of $${winner.prize_amount.toFixed(2)} has been processed.`
      });
    }

    res.json({
      success: true,
      message: 'Winner marked as paid successfully',
      data: updatedWinner
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark winner as paid'
    });
  }
};

/**
 * Get winner statistics (Admin only)
 * GET /api/winners/stats
 */
const getWinnerStats = async (req, res) => {
  try {
    // Total winners
    const { count: totalWinners } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true });

    // Pending verification
    const { count: pendingVerification } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    // Pending payment
    const { count: pendingPayment } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'approved')
      .eq('payment_status', 'pending');

    // Total prize money
    const { data: allWinners } = await supabaseAdmin
      .from('winners')
      .select('prize_amount, payment_status');

    const totalPrizePool = allWinners?.reduce((sum, w) => sum + parseFloat(w.prize_amount), 0) || 0;
    const totalPaid = allWinners?.filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + parseFloat(w.prize_amount), 0) || 0;

    res.json({
      success: true,
      data: {
        totalWinners: totalWinners || 0,
        pendingVerification: pendingVerification || 0,
        pendingPayment: pendingPayment || 0,
        totalPrizePool: parseFloat(totalPrizePool.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        pendingAmount: parseFloat((totalPrizePool - totalPaid).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get winner stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch winner statistics'
    });
  }
};

module.exports = {
  getMyWinnings,
  uploadProof,
  upload, // Export multer middleware
  getAllWinners,
  verifyWinner,
  markAsPaid,
  getWinnerStats
};
