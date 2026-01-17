const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Dashboard Statistics
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
