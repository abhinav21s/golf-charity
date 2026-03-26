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

// Protected user routes (MUST come before /:drawId to avoid matching "my" as a UUID)
router.get('/my/participation', authenticate, drawController.getMyParticipation);

// Public routes with parameters (MUST come after specific routes)
router.get('/:drawId', drawController.getDrawById);

// Admin routes
router.post('/create', authenticate, requireAdmin, validateDrawConfig, drawController.createDraw);

module.exports = router;
