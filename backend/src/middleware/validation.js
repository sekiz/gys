// Validation middleware - Joi kullanarak
const Joi = require('joi');

// XSS koruması için HTML tag'lerini temizle
// URL alanlarını sanitize etme (URL'lerde / karakteri gerekli)
function sanitizeInput(input, skipFields = [], currentKey = '') {
  if (typeof input === 'string') {
    // URL alanlarını sanitize etme
    if (skipFields.includes(currentKey) || currentKey.endsWith('Url') || currentKey.endsWith('URL')) {
      return input; // URL'leri olduğu gibi bırak
    }
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      // Kesme işareti zararsız olduğu için sanitize etmiyoruz
      // .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(input)) {
    return input.map((item, index) => sanitizeInput(item, skipFields, `${currentKey}[${index}]`));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      // URL alanlarını sanitize etme
      if (skipFields.includes(key) || key.endsWith('Url') || key.endsWith('URL')) {
        sanitized[key] = input[key]; // URL'leri olduğu gibi bırak
      } else {
        sanitized[key] = sanitizeInput(input[key], skipFields, key);
      }
    }
    return sanitized;
  }
  return input;
}

// Validation middleware factory
function validate(schema) {
  return (req, res, next) => {
    // Input sanitization (XSS koruması)
    // URL alanlarını sanitize etme
    const urlFields = ['twitterUrl', 'facebookUrl', 'instagramUrl', 'imageUrl'];
    if (req.body) {
      req.body = sanitizeInput(req.body, urlFields);
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors,
      });
    }

    req.body = value;
    next();
  };
}

// Validation şemaları
const schemas = {
  // Kullanıcı kayıt
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Şifre en az 6 karakter olmalıdır',
      'any.required': 'Şifre gereklidir',
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'İsim en az 2 karakter olmalıdır',
      'string.max': 'İsim en fazla 100 karakter olabilir',
      'any.required': 'İsim gereklidir',
    }),
  }),

  // Kullanıcı giriş
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Şifre gereklidir',
    }),
  }),

  // Soru oluştur
  createQuestion: Joi.object({
    topicId: Joi.string().uuid().required(),
    question: Joi.string().min(10).required(),
    type: Joi.string().valid('MULTIPLE_CHOICE', 'TRUE_FALSE').default('MULTIPLE_CHOICE'),
    options: Joi.when('type', {
      is: 'MULTIPLE_CHOICE',
      then: Joi.array().items(Joi.string().min(1)).min(2).max(5).required(),
      otherwise: Joi.array().items(Joi.string().min(1)).min(2).max(2).optional().default(['Doğru', 'Yanlış']),
    }),
    correctAnswer: Joi.number().integer().min(0).max(4).required(),
    explanation: Joi.string().allow('', null).optional(),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').default('MEDIUM'),
    isPreviousExam: Joi.boolean().optional(),
  }),

  // Sınav sonucu kaydet
  saveResult: Joi.object({
    examId: Joi.string().uuid().allow(null).optional(),
    topicId: Joi.string().uuid().allow(null).optional(),
    questionId: Joi.string().uuid().required(),
    isCorrect: Joi.boolean().required(),
    userAnswer: Joi.number().integer().optional(),
    timeSpent: Joi.number().integer().min(0).optional(),
  }),

  // Soru raporu
  reportQuestion: Joi.object({
    questionId: Joi.string().uuid().required(),
    reason: Joi.string().min(10).max(500).required(),
    description: Joi.string().max(1000).allow('', null).optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};
