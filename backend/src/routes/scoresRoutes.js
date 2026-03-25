/**
 * Scores Routes
 */

const express = require('express');
const router = express.Router();
const scoresController = require('../controllers/scoresController');
const { authenticate, requireSubscription } = require('../middleware/auth');
const { validateScore } = require('../middleware/validation');

// All routes require authentication and active subscription
router.use(authenticate);
router.use(requireSubscription);

router.get('/', scoresController.getScores);
router.post('/', validateScore, scoresController.addScore);
router.put('/:scoreId', validateScore, scoresController.updateScore);
router.delete('/:scoreId', scoresController.deleteScore);
router.get('/stats', scoresController.getScoreStats);

module.exports = router;
