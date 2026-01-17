// Global error handler middleware
function errorHandler(err, req, res, next) {
  console.error('Hata:', err);

  // Prisma hataları
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Bu kayıt zaten mevcut',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Kayıt bulunamadı',
    });
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token süresi dolmuş',
    });
  }

  // Validation hataları
  if (err.isJoi) {
    const errorMessages = err.details.map(detail => {
      const field = detail.path.join('.');
      let message = detail.message;
      
      // Türkçe hata mesajları
      if (field === 'question') {
        if (message.includes('length must be at least')) {
          message = 'Soru metni en az 10 karakter olmalıdır.';
        }
      } else if (field === 'options') {
        if (message.includes('length must be at least')) {
          message = 'En az 2 seçenek girilmelidir.';
        } else if (message.includes('length must be less than or equal to')) {
          message = 'En fazla 5 seçenek girilebilir.';
        } else if (message.includes('must be a string')) {
          message = 'Seçenekler metin olmalıdır.';
        }
      } else if (field === 'correctAnswer') {
        if (message.includes('must be less than or equal to')) {
          message = 'Doğru cevap 0-4 arası bir değer olmalıdır (A=0, B=1, C=2, D=3, E=4).';
        }
      } else if (field === 'topicId') {
        if (message.includes('must be a valid GUID')) {
          message = 'Geçerli bir konu seçiniz.';
        }
      } else if (field === 'currentPassword') {
        if (message.includes('required')) {
          message = 'Mevcut şifre gereklidir.';
        } else if (message.includes('empty')) {
          message = 'Mevcut şifre boş olamaz.';
        }
      } else if (field === 'newPassword') {
        if (message.includes('length must be at least')) {
          message = 'Yeni şifre en az 8 karakter olmalıdır.';
        } else if (message.includes('pattern')) {
          message = 'Yeni şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter (@$!%*?&) içermelidir.';
        } else if (message.includes('required')) {
          message = 'Yeni şifre gereklidir.';
        } else if (message.includes('empty')) {
          message = 'Yeni şifre boş olamaz.';
        }
      }
      
      return { field, message };
    });
    
    // İlk hata mesajını ana mesaj olarak kullan
    const mainMessage = errorMessages.length > 0 
      ? (errorMessages[0].message || 'Doğrulama hatası')
      : 'Doğrulama hatası';
    
    return res.status(400).json({
      success: false,
      message: mainMessage,
      errors: errorMessages,
    });
  }

  // Varsayılan hata
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Bir hata oluştu' 
    : err.message;

  // Production'da stack trace gizle
  const response = {
    success: false,
    message,
  };

  // Sadece development'ta stack trace göster
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err.message;
  }

  res.status(statusCode).json(response);
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı',
    path: req.originalUrl,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
