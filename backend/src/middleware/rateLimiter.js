// Rate Limiting Middleware'leri
const rateLimit = require('express-rate-limit');

/**
 * Auth endpoint'leri için rate limiter
 * Development'ta: 50 deneme / 15 dakika
 * Production'da: 5 deneme / 15 dakika
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Development'ta daha yüksek limit
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
});

/**
 * Register endpoint'i için rate limiter
 * 3 kayıt / saat
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // Her IP için maksimum 3 kayıt
  message: {
    success: false,
    message: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Şifre sıfırlama için rate limiter
 * 3 istek / saat
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // Her IP için maksimum 3 istek
  message: {
    success: false,
    message: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Genel API rate limiter
 * Limit kaldırıldı - Sınırsız kullanıcı desteği için
 * Not: Sadece abuse prevention için çok yüksek bir limit var (10,000 istek/15 dakika)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10000, // Çok yüksek limit - sadece abuse prevention için
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Admin ve Instructor'lar için rate limiting'i atla
    return req.user?.role === 'ADMIN' || req.user?.role === 'INSTRUCTOR';
  },
});

module.exports = {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  apiLimiter,
};
