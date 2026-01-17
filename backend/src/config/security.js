// Güvenlik yapılandırması
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Helmet yapılandırması
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting - Genel API (artık middleware/rateLimiter.js'de tanımlı)
// Bu dosyadaki apiLimiter kullanılmıyor, sadece backward compatibility için
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Development'ta daha yüksek limit
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Auth endpoint'leri (eski, artık middleware/rateLimiter.js'de)
// Bu dosya genel API rate limiting için kullanılıyor
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Her IP için maksimum 5 istek
  message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS yapılandırması
const corsOptions = {
  origin: function (origin, callback) {
    // Development modunda tüm origin'lere izin ver
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // Origin yoksa (Postman, mobile app gibi) izin ver
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS: İzin verilmeyen origin:', origin);
      callback(new Error('CORS politikası tarafından izin verilmedi'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  corsOptions,
};
