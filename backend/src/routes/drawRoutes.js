/**
 * Draw Routes
 */

const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateDrawConfig } = require('../middleware/validation');

// Public routes (view published draws)
router.get('/', drawController.getDraws);
router.get('/:drawId', drawController.getDrawById);

// Protected user routes
router.get('/my/participation', authenticate, drawController.getMyParticipation);

// Admin routes
router.post('/create', authenticate, requireAdmin, validateDrawConfig, drawController.createDraw);

module.exports = router;
