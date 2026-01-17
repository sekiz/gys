// Authentication middleware (ESKİ - artık authMiddleware.js kullanılıyor)
// Bu dosya backward compatibility için tutuluyor
// Yeni projelerde authMiddleware.js kullanılmalı

const { verifyToken, isAdmin, isInstructor } = require('./authMiddleware');

// Eski authenticate fonksiyonu - artık verifyToken kullanılıyor
const authenticate = verifyToken;

// Backward compatibility için alias'lar
const requireAdmin = isAdmin;
const requireInstructor = isInstructor;

module.exports = {
  authenticate, // Backward compatibility
  verifyToken, // Yeni isim
  isAdmin,
  isInstructor,
  requireAdmin, // Backward compatibility
  requireInstructor, // Backward compatibility
};
