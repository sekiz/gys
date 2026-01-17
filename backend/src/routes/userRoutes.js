// User Routes - Admin kullanıcı yönetimi
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * Kullanıcı güncelleme validasyon şeması
 */
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).allow('', null).optional().messages({
    'string.min': 'İsim en az 2 karakter olmalıdır.',
    'string.max': 'İsim en fazla 100 karakter olabilir.',
  }),
  email: Joi.string().email().allow('', null).optional().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.',
  }),
  role: Joi.string().valid('STUDENT', 'ADMIN', 'INSTRUCTOR').optional().messages({
    'any.only': 'Rol STUDENT, ADMIN veya INSTRUCTOR olmalıdır.',
  }),
  password: Joi.string().min(8).allow('', null).optional().messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır.',
  }),
  isActive: Joi.boolean().optional(),
});

// Tüm route'lar admin yetkisi gerektirir
router.use(verifyToken);
router.use(isAdmin);

// Kullanıcı listesi
router.get('/', getAllUsers);

// Kullanıcı detayı
router.get('/:id', getUser);

// Kullanıcı güncelle
router.put('/:id', validate(updateUserSchema), updateUser);

// Kullanıcı sil
router.delete('/:id', deleteUser);

// Kullanıcı aktif/pasif durumunu değiştir
router.patch('/:id/toggle-active', toggleUserActive);

module.exports = router;
