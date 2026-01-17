// Exam Routes
const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  getPublicExams,
  getTopics,
  getTopic,
  getArticles,
  getSummaries,
  createExam,
  updateExam,
  deleteExam,
  createTopic,
  updateTopic,
  deleteTopic,
  createArticle,
  updateArticle,
  deleteArticle,
  createSummary,
  updateSummary,
  deleteSummary,
} = require('../controllers/examController');
const { verifyToken, checkExamPackage, isAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Public route (token gerektirmez - landing page için)
router.get('/public/list', getPublicExams);

// Tüm route'lar token gerektirir
router.use(verifyToken);

// Sınavları listele (kullanıcı sadece aktif paketini görür)
router.get('/', getExams);

// Tek bir sınavı getir (paket kontrolü yapılır)
router.get('/:id', checkExamPackage, getExam);

// Konuları listele (paket kontrolü yapılır)
router.get('/topics/list', checkExamPackage, getTopics);

// Tek bir konuyu getir (paket kontrolü yapılır)
router.get('/topics/:id', checkExamPackage, getTopic);

// Konu maddelerini getir (paket kontrolü yapılır)
router.get('/articles/list', checkExamPackage, getArticles);

// Konu özetlerini getir (paket kontrolü yapılır)
router.get('/summaries/list', checkExamPackage, getSummaries);

// Admin routes
const examSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Sınav adı en az 2 karakter olmalıdır.',
    'string.max': 'Sınav adı en fazla 200 karakter olabilir.',
    'any.required': 'Sınav adı gereklidir.',
  }),
  description: Joi.string().max(1000).optional().messages({
    'string.max': 'Açıklama en fazla 1000 karakter olabilir.',
  }),
  code: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Kod en az 2 karakter olmalıdır.',
    'string.max': 'Kod en fazla 50 karakter olabilir.',
    'any.required': 'Kod gereklidir.',
  }),
  imageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Geçerli bir URL giriniz.',
  }),
  price: Joi.number().min(0).optional().allow(null, '').messages({
    'number.min': 'Fiyat 0 veya daha büyük olmalıdır.',
  }),
  isActive: Joi.boolean().optional(),
});

const updateExamSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(null, ''),
  code: Joi.string().min(2).max(50).optional(),
  imageUrl: Joi.string().uri().optional().allow(null, ''),
  price: Joi.number().min(0).optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

// Admin: Yeni sınav oluştur
router.post('/', isAdmin, validate(examSchema), createExam);

// Admin: Sınav güncelle
router.put('/:id', isAdmin, validate(updateExamSchema), updateExam);

// Admin: Sınav sil
router.delete('/:id', isAdmin, deleteExam);

// Admin: Topic CRUD
const topicSchema = Joi.object({
  examId: Joi.string().uuid().required().messages({
    'string.uuid': 'Geçerli bir sınav ID\'si giriniz.',
    'any.required': 'Sınav ID\'si gereklidir.',
  }),
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Konu adı en az 2 karakter olmalıdır.',
    'string.max': 'Konu adı en fazla 200 karakter olabilir.',
    'any.required': 'Konu adı gereklidir.',
  }),
  description: Joi.string().max(1000).optional().allow(null, ''),
  order: Joi.number().integer().optional(),
});

router.post('/topics', isAdmin, validate(topicSchema), createTopic);
router.put('/topics/:id', isAdmin, validate(topicSchema.keys({ examId: Joi.optional() })), updateTopic);
router.delete('/topics/:id', isAdmin, deleteTopic);

// Admin: Article ve Summary oluşturma
const articleSchema = Joi.object({
  topicId: Joi.string().uuid().required().messages({
    'string.uuid': 'Geçerli bir konu ID\'si giriniz.',
    'any.required': 'Konu ID\'si gereklidir.',
  }),
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Başlık en az 2 karakter olmalıdır.',
    'string.max': 'Başlık en fazla 200 karakter olabilir.',
    'any.required': 'Başlık gereklidir.',
  }),
  content: Joi.string().required().messages({
    'any.required': 'İçerik gereklidir.',
  }),
  order: Joi.number().integer().optional(),
});

const summarySchema = Joi.object({
  topicId: Joi.string().uuid().required().messages({
    'string.uuid': 'Geçerli bir konu ID\'si giriniz.',
    'any.required': 'Konu ID\'si gereklidir.',
  }),
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Başlık en az 2 karakter olmalıdır.',
    'string.max': 'Başlık en fazla 200 karakter olabilir.',
    'any.required': 'Başlık gereklidir.',
  }),
  content: Joi.string().required().messages({
    'any.required': 'İçerik gereklidir.',
  }),
  order: Joi.number().integer().optional(),
});

router.post('/articles', isAdmin, validate(articleSchema), createArticle);
router.put('/articles/:id', isAdmin, validate(articleSchema.keys({ topicId: Joi.optional() })), updateArticle);
router.delete('/articles/:id', isAdmin, deleteArticle);

router.post('/summaries', isAdmin, validate(summarySchema), createSummary);
router.put('/summaries/:id', isAdmin, validate(summarySchema.keys({ topicId: Joi.optional() })), updateSummary);
router.delete('/summaries/:id', isAdmin, deleteSummary);

module.exports = router;
