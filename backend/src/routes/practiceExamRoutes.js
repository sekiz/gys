// Practice Exam Routes (Deneme Sınavı)
const express = require('express');
const router = express.Router();
const {
  getPracticeExams,
  getPracticeExamsByExam,
  getPracticeExam,
  createPracticeExam,
  updatePracticeExam,
  deletePracticeExam,
  submitPracticeExam,
  getPracticeExamResults,
  getPracticeExamResultDetail,
} = require('../controllers/practiceExamController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, isInstructor } = require('../middleware/authMiddleware');

// Tüm deneme sınavlarını getir (kullanıcılar için aktif olanlar)
router.get('/', verifyToken, getPracticeExams);

// Belirli bir sınava ait deneme sınavlarını getir (Admin)
router.get('/exam/:examId', verifyToken, isInstructor, getPracticeExamsByExam);

// ÖNEMLİ: Daha spesifik route'lar önce gelmeli
// Tek bir sonucu detaylı getir (sorularla birlikte) - /:id'den önce olmalı
router.get('/results/:resultId', verifyToken, getPracticeExamResultDetail);

// Kullanıcının deneme sınavı sonuçlarını getir - /:id'den önce olmalı
router.get('/:id/results', verifyToken, getPracticeExamResults);

// Tek bir deneme sınavını getir
router.get('/:id', verifyToken, getPracticeExam);

// Deneme sınavı oluştur (Admin)
router.post('/', verifyToken, isInstructor, createPracticeExam);

// Deneme sınavı güncelle (Admin)
router.put('/:id', verifyToken, isInstructor, updatePracticeExam);

// Deneme sınavı sil (Admin)
router.delete('/:id', verifyToken, isInstructor, deletePracticeExam);

// Deneme sınavı sonucunu kaydet
router.post('/:id/submit', verifyToken, submitPracticeExam);

module.exports = router;
