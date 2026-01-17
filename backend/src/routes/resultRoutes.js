// Result Routes
const express = require('express');
const router = express.Router();
const {
  saveResult,
  getStats,
  getTopicStats,
  getAllTopicStats,
  resetStats,
} = require('../controllers/resultController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');

// Protected routes
router.post('/', verifyToken, validate(schemas.saveResult), saveResult);
router.get('/stats', verifyToken, getStats);
router.get('/stats/topics', verifyToken, getTopicStats); // Günlük konu istatistikleri
router.get('/stats/topics/all', verifyToken, getAllTopicStats); // Tüm zamanlar konu istatistikleri
router.delete('/stats', verifyToken, resetStats);

module.exports = router;
