// Footer Routes - Footer yönetimi için API endpoint'leri
const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const updateFooterSchema = Joi.object({
  description: Joi.string().allow('', null).optional(),
  email: Joi.alternatives().try(
    Joi.string().email().allow('', null),
    Joi.string().allow('', null)
  ).optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  twitterUrl: Joi.alternatives().try(
    Joi.string().uri().allow('', null),
    Joi.string().allow('', null)
  ).optional(),
  facebookUrl: Joi.alternatives().try(
    Joi.string().uri().allow('', null),
    Joi.string().allow('', null)
  ).optional(),
  instagramUrl: Joi.alternatives().try(
    Joi.string().uri().allow('', null),
    Joi.string().allow('', null)
  ).optional(),
  privacyPolicyContent: Joi.string().allow('', null).optional(),
  termsContent: Joi.string().allow('', null).optional(),
  mesafeliSatisSozlesmesi: Joi.string().allow('', null).optional(),
  kisiselVerilerIsleme: Joi.string().allow('', null).optional(),
  uyelikSozlesmesi: Joi.string().allow('', null).optional(),
});

// Public routes
router.get('/', footerController.getFooter);
router.get('/privacy', footerController.getPrivacyPolicy);
router.get('/terms', footerController.getTerms);
router.get('/mesafeli-satis', footerController.getMesafeliSatis);
router.get('/kisisel-veriler', footerController.getKisiselVeriler);
router.get('/uyelik-sozlesmesi', footerController.getUyelikSozlesmesi);

// Admin routes
router.put('/', verifyToken, isAdmin, validate(updateFooterSchema), footerController.updateFooter);

module.exports = router;
