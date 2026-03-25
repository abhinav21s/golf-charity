/**
 * Charity Routes
 */

const express = require('express');
const router = express.Router();
const charityController = require('../controllers/charityController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateCharitySelection } = require('../middleware/validation');

// Public routes
router.get('/', charityController.getCharities);
router.get('/:charityId', charityController.getCharityById);

// Protected user routes
router.post('/select', authenticate, validateCharitySelection, charityController.selectCharity);
router.get('/my/charity', authenticate, charityController.getMyCharity);
router.get('/my/contributions', authenticate, charityController.getMyContributions);

// Admin routes
router.post('/admin/create', authenticate, requireAdmin, charityController.createCharity);
router.put('/admin/:charityId', authenticate, requireAdmin, charityController.updateCharity);
router.delete('/admin/:charityId', authenticate, requireAdmin, charityController.deleteCharity);
router.get('/admin/stats', authenticate, requireAdmin, charityController.getCharityStats);

module.exports = router;
