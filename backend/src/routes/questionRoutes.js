// Question Routes
const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestion,
  getMixedQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reportQuestion,
  getQuestionReports,
  updateReportStatus,
} = require('../controllers/questionController');
const { verifyToken, isInstructor, checkExamPackage } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');
const Joi = require('joi');

// Tüm route'lar token gerektirir
router.use(verifyToken);

// Soruları listele (paket kontrolü yapılır)
router.get('/', checkExamPackage, getQuestions);

// Karışık sorular getir (paket kontrolü yapılır)
router.get('/mixed', checkExamPackage, getMixedQuestions);

// Tek bir soruyu getir (paket kontrolü yapılır)
router.get('/:id', checkExamPackage, getQuestion);

// Soru raporla
router.post('/report', validate(schemas.reportQuestion), reportQuestion);

// Admin: Soru raporlarını getir
router.get('/reports/all', isInstructor, getQuestionReports);

// Admin: Rapor durumunu güncelle
router.put('/reports/:id/status', isInstructor, validate(Joi.object({
  status: Joi.string().valid('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED').required(),
})), updateReportStatus);

// Instructor/Admin routes
router.post('/', isInstructor, validate(schemas.createQuestion), createQuestion);
router.put('/:id', isInstructor, validate(schemas.createQuestion.keys({
  topicId: Joi.optional(),
  question: Joi.optional(),
  type: Joi.optional(),
  options: Joi.optional(),
  correctAnswer: Joi.optional(),
  explanation: Joi.optional(),
  difficulty: Joi.optional(),
  isActive: Joi.boolean().optional(),
  isPreviousExam: Joi.boolean().optional(),
})), updateQuestion);
router.delete('/:id', isInstructor, deleteQuestion);

module.exports = router;
