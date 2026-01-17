// Authentication Routes
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { verifyToken, verifyRefreshTokenMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require('../utils/validators');
const {
  registerLimiter,
  authLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');

// Public routes

// Kayıt
router.post(
  '/register',
  registerLimiter, // Rate limiting
  validate(registerSchema), // Validation
  register
);

// Giriş
router.post(
  '/login',
  authLimiter, // Rate limiting (5 deneme / 15 dakika)
  validate(loginSchema), // Validation
  login
);

// Şifremi unuttum
router.post(
  '/forgot-password',
  passwordResetLimiter, // Rate limiting
  validate(forgotPasswordSchema), // Validation
  forgotPassword
);

// Şifre sıfırlama (token ile)
router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema), // Validation
  resetPassword
);

// Refresh token
router.post(
  '/refresh-token',
  validate(refreshTokenSchema), // Validation
  verifyRefreshTokenMiddleware, // Refresh token doğrulama
  refreshToken
);

// Protected routes (token gerektirir)

// Mevcut kullanıcı bilgileri
router.get('/me', verifyToken, getMe);

// Şifre değiştirme
router.put(
  '/change-password',
  verifyToken, // Token doğrulama
  validate(changePasswordSchema), // Validation
  changePassword
);

// Profil güncelleme
router.put(
  '/profile',
  verifyToken, // Token doğrulama
  validate(updateProfileSchema), // Validation
  updateProfile
);

// Logout
router.post('/logout', verifyToken, logout);

module.exports = router;
