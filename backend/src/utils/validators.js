// Joi Validation Şemaları - Türkçe hata mesajları
const Joi = require('joi');

// Email regex pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Şifre regex pattern (en az 8 karakter, büyük harf, küçük harf, rakam, özel karakter)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Kayıt validasyon şeması
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(emailRegex)
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'string.pattern.base': 'Geçerli bir e-posta formatı giriniz',
      'any.required': 'E-posta adresi gereklidir',
      'string.empty': 'E-posta adresi boş olamaz',
    }),

  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.min': 'Şifre en az 8 karakter olmalıdır',
      'string.pattern.base': 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
      'any.required': 'Şifre gereklidir',
      'string.empty': 'Şifre boş olamaz',
    }),

  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'İsim en az 2 karakter olmalıdır',
      'string.max': 'İsim en fazla 100 karakter olabilir',
      'any.required': 'İsim gereklidir',
      'string.empty': 'İsim boş olamaz',
    }),

  city: Joi.string().allow('', null).optional(),
  institution: Joi.string().allow('', null).optional(),
});

/**
 * Giriş validasyon şeması
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .messages({
      'any.required': 'E-posta adresi veya kullanıcı adı gereklidir',
      'string.empty': 'E-posta adresi veya kullanıcı adı boş olamaz',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Şifre gereklidir',
      'string.empty': 'Şifre boş olamaz',
    }),
});

/**
 * Profil güncelleme validasyon şeması
 */
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).allow('', null).optional().messages({
    'string.min': 'İsim en az 2 karakter olmalıdır.',
    'string.max': 'İsim en fazla 100 karakter olabilir.',
  }),
  email: Joi.string().email().allow('', null).optional().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.',
  }),
  city: Joi.string().max(100).allow('', null).optional().messages({
    'string.max': 'Şehir adı en fazla 100 karakter olabilir.',
  }),
});

/**
 * Şifre değiştirme validasyon şeması
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mevcut şifre gereklidir',
      'string.empty': 'Mevcut şifre boş olamaz',
    }),

  newPassword: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.min': 'Yeni şifre en az 8 karakter olmalıdır',
      'string.pattern.base': 'Yeni şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
      'any.required': 'Yeni şifre gereklidir',
      'string.empty': 'Yeni şifre boş olamaz',
    }),
});

/**
 * Şifre sıfırlama (forgot password) validasyon şeması
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
      'string.empty': 'E-posta adresi boş olamaz',
    }),
});

/**
 * Şifre sıfırlama (reset password) validasyon şeması
 */
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.min': 'Şifre en az 8 karakter olmalıdır',
      'string.pattern.base': 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
      'any.required': 'Şifre gereklidir',
      'string.empty': 'Şifre boş olamaz',
    }),
});

/**
 * Refresh token validasyon şeması
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token gereklidir',
      'string.empty': 'Refresh token boş olamaz',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
