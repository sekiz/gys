// Authentication Middleware'leri
const { prisma } = require('../config/database');
const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwtUtils');

/**
 * Access token doğrulama middleware'i
 * Protected route'lar için kullanılır
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme token\'ı bulunamadı. Lütfen giriş yapın.',
      });
    }

    const token = authHeader.substring(7); // "Bearer " kısmını çıkar
    
    // Token'ı doğrula
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token. Lütfen tekrar giriş yapın.',
      });
    }

    // Kullanıcıyı veritabanından al
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        refreshToken: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin.',
      });
    }

    // Token blacklist kontrolü (logout sonrası)
    // Eğer refreshToken null ise, kullanıcı logout yapmış demektir
    // Bu durumda access token'ı da geçersiz sayabiliriz
    // (İsteğe bağlı - daha güvenli ama performans maliyeti var)

    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme hatası.',
    });
  }
}

/**
 * Admin kontrolü middleware'i
 * verifyToken'dan sonra kullanılmalı
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme gerekli. Lütfen giriş yapın.',
    });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir.',
    });
  }
  next();
}

/**
 * Instructor veya Admin kontrolü
 */
function isInstructor(req, res, next) {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için yetki gereklidir.',
    });
  }
  next();
}

/**
 * Kullanıcının belirli bir exam paketine erişim yetkisi olup olmadığını kontrol eder
 * Admin'ler her zaman erişebilir
 * verifyToken'dan sonra kullanılmalı
 * 
 * Kullanım:
 * - req.params.examId varsa onu kullanır
 * - req.body.examId varsa onu kullanır
 * - req.query.examId varsa onu kullanır
 */
async function checkExamPackage(req, res, next) {
  try {
    // Admin'ler her zaman erişebilir
    if (req.user.role === 'ADMIN' || req.user.role === 'INSTRUCTOR') {
      return next();
    }

    // Exam ID'yi bul (params, body veya query'den)
    const examId = req.params.examId || req.body.examId || req.query.examId;

    if (!examId) {
      // Exam ID yoksa, kullanıcının aktif paketini kontrol et (genel erişim kontrolü)
      const activePackage = await prisma.userPackage.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACTIVE',
        },
        include: {
          exam: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!activePackage) {
        return res.status(403).json({
          success: false,
          message: 'Aktif bir paketiniz bulunmamaktadır. Lütfen paket satın alın.',
        });
      }

      // Paket süresi dolmuş mu kontrol et
      if (activePackage.expiresAt && activePackage.expiresAt < new Date()) {
        // Paketi expired yap
        await prisma.userPackage.update({
          where: { id: activePackage.id },
          data: { status: 'EXPIRED' },
        });

        return res.status(403).json({
          success: false,
          message: 'Paketinizin süresi dolmuştur. Lütfen yeni bir paket satın alın.',
        });
      }

      // Aktif paketi req'e ekle (controller'larda kullanılabilir)
      req.userPackage = activePackage;
      return next();
    }

    // Belirli bir exam için kontrol
    // Kullanıcının bu exam'e ait aktif paketi var mı?
    const activePackage = await prisma.userPackage.findFirst({
      where: {
        userId: req.user.id,
        examId: examId,
        status: 'ACTIVE',
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!activePackage) {
      return res.status(403).json({
        success: false,
        message: 'Bu pakete erişim yetkiniz bulunmamaktadır. Lütfen paket satın alın.',
      });
    }

    // Paket süresi dolmuş mu kontrol et
    if (activePackage.expiresAt && activePackage.expiresAt < new Date()) {
      // Paketi expired yap
      await prisma.userPackage.update({
        where: { id: activePackage.id },
        data: { status: 'EXPIRED' },
      });

      return res.status(403).json({
        success: false,
        message: 'Paketinizin süresi dolmuştur. Lütfen yeni bir paket satın alın.',
      });
    }

    // Aktif paketi req'e ekle (controller'larda kullanılabilir)
    req.userPackage = activePackage;
    next();
  } catch (error) {
    console.error('Paket kontrolü hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Paket kontrolü sırasında bir hata oluştu.',
    });
  }
}

/**
 * Refresh token doğrulama middleware'i
 */
async function verifyRefreshTokenMiddleware(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token gereklidir.',
      });
    }

    // Token'ı doğrula
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş refresh token.',
      });
    }

    // Kullanıcıyı veritabanından al
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        refreshToken: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız pasif durumda.',
      });
    }

    // Refresh token'ın veritabanındaki ile eşleştiğini kontrol et
    // (Logout sonrası refreshToken null olur)
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz refresh token. Lütfen tekrar giriş yapın.',
      });
    }

    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    console.error('Refresh token doğrulama hatası:', error);
    return res.status(401).json({
      success: false,
      message: 'Token doğrulama hatası.',
    });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  isInstructor,
  checkExamPackage,
  verifyRefreshTokenMiddleware,
};
