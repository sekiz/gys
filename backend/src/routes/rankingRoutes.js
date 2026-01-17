// Ranking Routes - Kullanıcı sıralaması
const express = require('express');
const router = express.Router();
const { getRankings, getSiteAverage } = require('../controllers/rankingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm kullanıcıların sıralamasını getir (giriş yapmış kullanıcılar için)
router.get('/', verifyToken, getRankings);

// Site başarı ortalamasını getir
router.get('/average', verifyToken, getSiteAverage);

module.exports = router;
