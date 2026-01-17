const express = require('express');
const router = express.Router();
const heroSlideController = require('../controllers/heroSlideController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', heroSlideController.getPublicSlides);

// Admin routes
router.get('/', verifyToken, isAdmin, heroSlideController.getAllSlides);
router.post('/', verifyToken, isAdmin, heroSlideController.createSlide);
router.put('/reorder', verifyToken, isAdmin, heroSlideController.reorderSlides); // Order matters, specific paths before :id
router.put('/:id', verifyToken, isAdmin, heroSlideController.updateSlide);
router.delete('/:id', verifyToken, isAdmin, heroSlideController.deleteSlide);

module.exports = router;
