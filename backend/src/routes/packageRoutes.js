// Package Routes - Paket satın alma ve yönetimi
const express = require('express');
const router = express.Router();
const {
  requestPackage,
  getMyPackages,
  getMyActivePackage,
  getPendingPackages,
  approvePackage,
  rejectPackage,
  cancelPackage,
  assignPackageToUser,
  getAllUserPackages,
} = require('../controllers/packageController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation şemaları
const requestPackageSchema = Joi.object({
  examId: Joi.string().uuid().required().messages({
    'string.uuid': 'Geçerli bir paket ID\'si giriniz.',
    'any.required': 'Paket ID\'si gereklidir.',
  }),
});

const approvePackageSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Notlar en fazla 500 karakter olabilir.',
  }),
  expiresAt: Joi.date().optional().allow(null, '').messages({
    'date.base': 'Geçerli bir tarih giriniz.',
  }),
});

const rejectPackageSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Notlar en fazla 500 karakter olabilir.',
  }),
});

const cancelPackageSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Notlar en fazla 500 karakter olabilir.',
  }),
});

const assignPackageSchema = Joi.object({
  userId: Joi.string().uuid().optional().messages({
    'string.uuid': 'Geçerli bir kullanıcı ID\'si giriniz.',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).optional().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.',
  }),
  examId: Joi.string().uuid().required().messages({
    'string.uuid': 'Geçerli bir paket ID\'si giriniz.',
    'any.required': 'Paket ID\'si gereklidir.',
  }),
  expiresAt: Joi.date().optional().messages({
    'date.base': 'Geçerli bir tarih giriniz.',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notlar en fazla 500 karakter olabilir.',
  }),
}).or('userId', 'email').messages({
  'object.missing': 'Kullanıcı ID\'si veya e-posta adresi gereklidir.',
});

// Kullanıcı route'ları (token gerektirir)
router.post(
  '/request',
  verifyToken,
  validate(requestPackageSchema),
  requestPackage
);

router.get(
  '/my-packages',
  verifyToken,
  getMyPackages
);

router.get(
  '/my-active-package',
  verifyToken,
  getMyActivePackage
);

// Admin route'ları
router.get(
  '/pending',
  verifyToken,
  isAdmin,
  getPendingPackages
);

router.get(
  '/all',
  verifyToken,
  isAdmin,
  getAllUserPackages
);

router.post(
  '/:packageId/approve',
  verifyToken,
  isAdmin,
  validate(approvePackageSchema),
  approvePackage
);

router.post(
  '/:packageId/reject',
  verifyToken,
  isAdmin,
  validate(rejectPackageSchema),
  rejectPackage
);

router.post(
  '/:packageId/cancel',
  verifyToken,
  isAdmin,
  validate(cancelPackageSchema),
  cancelPackage
);

router.post(
  '/assign',
  verifyToken,
  isAdmin,
  validate(assignPackageSchema),
  assignPackageToUser
);

module.exports = router;
