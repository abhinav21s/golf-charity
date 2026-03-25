/**
 * Winners Routes
 */

const express = require('express');
const router = express.Router();
const winnersController = require('../controllers/winnersController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateWinnerVerification } = require('../middleware/validation');

// Protected user routes
router.get('/my/winnings', authenticate, winnersController.getMyWinnings);
router.post('/:winnerId/upload-proof', 
  authenticate, 
  winnersController.upload.single('proof'), 
  winnersController.uploadProof
);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, winnersController.getAllWinners);
router.put('/admin/:winnerId/verify', authenticate, requireAdmin, validateWinnerVerification, winnersController.verifyWinner);
router.put('/admin/:winnerId/mark-paid', authenticate, requireAdmin, winnersController.markAsPaid);
router.get('/admin/stats', authenticate, requireAdmin, winnersController.getWinnerStats);

module.exports = router;
