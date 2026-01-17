// Authentication Controller - Production Ready
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
} = require('../utils/jwtUtils');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailUtils');
const { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION, RESET_TOKEN_EXPIRY } = require('../config/auth');

/**
 * Kullanıcı kaydı
 */
async function register(req, res, next) {
  try {
    const { email, password, name, city, institution } = req.body;

    // Email unique kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor.',
      });
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        city: city ? city.trim() : null,
        institution: institution ? institution.trim() : null,
        role: 'STUDENT',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        institution: true,
        role: true,
        createdAt: true,
      },
    });

    // Token'ları oluştur
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Refresh token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Hoş geldin email'i gönder (şimdilik console.log)
    await sendWelcomeEmail(user.email, user.name);

    // Başarılı kayıt logla
    console.log(`✅ Yeni kullanıcı kaydı: ${user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı. Hoş geldiniz!',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcı girişi
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Güvenlik: Kullanıcı yoksa da aynı mesajı dön (timing attack koruması)
      await new Promise(resolve => setTimeout(resolve, 100)); // Sabit gecikme

      console.log(`❌ Başarısız giriş denemesi: ${email} - IP: ${clientIp} - ${new Date().toISOString()}`);

      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.',
      });
    }

    // Hesap kilitli mi kontrol et
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Hesabınız ${remainingMinutes} dakika süreyle kilitlendi. Çok fazla başarısız giriş denemesi.`,
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Başarısız giriş denemesi sayısını artır
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const updateData = { loginAttempts };

      // Maksimum deneme sayısına ulaşıldıysa hesabı kilitle
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        updateData.loginAttempts = 0; // Sıfırla, kilitlenme süresi bitince
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      console.log(`❌ Başarısız giriş denemesi: ${user.email} - IP: ${clientIp} - Deneme: ${loginAttempts}/${MAX_LOGIN_ATTEMPTS} - ${new Date().toISOString()}`);

      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.',
        ...(loginAttempts >= MAX_LOGIN_ATTEMPTS && {
          lockout: true,
          message: `Çok fazla başarısız giriş denemesi. Hesabınız 15 dakika süreyle kilitlendi.`,
        }),
      });
    }

    // Başarılı giriş - token'ları oluştur
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Kullanıcı bilgilerini güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
        loginAttempts: 0, // Başarılı girişte sıfırla
        lockedUntil: null, // Kilitlenmeyi kaldır
      },
    });

    // Başarılı giriş logla
    console.log(`✅ Başarılı giriş: ${user.email} - IP: ${clientIp} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: new Date(),
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    next(error);
  }
}

/**
 * Refresh token ile yeni access token al
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const user = req.user; // verifyRefreshTokenMiddleware'den geliyor

    // Yeni token'ları oluştur
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Yeni refresh token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      success: true,
      message: 'Token yenilendi.',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    next(error);
  }
}

/**
 * Logout - Token'ı blacklist'e ekle
 */
async function logout(req, res, next) {
  try {
    const user = req.user; // verifyToken middleware'den geliyor

    // Refresh token'ı null yap (blacklist)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    console.log(`✅ Çıkış yapıldı: ${user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı.',
    });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    next(error);
  }
}

/**
 * Mevcut kullanıcı bilgilerini getir
 */
async function getMe(req, res, next) {
  try {
    const user = req.user; // verifyToken middleware'den geliyor

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error('Kullanıcı bilgisi getirme hatası:', error);
    next(error);
  }
}

/**
 * Şifre değiştirme
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user; // verifyToken middleware'den geliyor

    // Mevcut şifreyi kontrol et
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    const isPasswordValid = await comparePassword(currentPassword, userWithPassword.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut şifre hatalı.',
      });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await hashPassword(newPassword);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Şifre değiştirildi: ${user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi.',
    });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    next(error);
  }
}

/**
 * Profil güncelleme (isim ve e-posta)
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email, city } = req.body;
    const user = req.user; // verifyToken middleware'den geliyor

    // En az bir alan doldurulmalı (city hariç, opsiyonel)
    const hasName = name !== undefined && name !== null && String(name).trim() !== '';
    const hasEmail = email !== undefined && email !== null && String(email).trim() !== '';
    const hasCity = city !== undefined && city !== null && String(city).trim() !== '';

    if (!hasName && !hasEmail && !hasCity) {
      return res.status(400).json({
        success: false,
        message: 'En az bir alan (isim, e-posta veya şehir) güncellenmelidir.',
      });
    }

    // E-posta değişiyorsa unique kontrolü yap
    if (hasEmail && email.toLowerCase().trim() !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Bu e-posta adresi zaten kullanılıyor.',
        });
      }
    }

    // Güncelleme verilerini hazırla
    const updateData = {};
    if (hasName) {
      updateData.name = name.trim();
    }
    if (hasEmail) {
      updateData.email = email.toLowerCase().trim();
    }
    // City her zaman güncellenebilir (opsiyonel)
    if (city !== undefined) {
      updateData.city = city === null || city === '' ? null : city.trim();
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Profil güncellendi: ${updatedUser.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    next(error);
  }
}

/**
 * Şifremi unuttum - Reset token oluştur
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const resetUrl = process.env.RESET_PASSWORD_URL || 'http://localhost:3000';

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Güvenlik: Kullanıcı yoksa da aynı mesajı dön (email enumeration koruması)
    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Sabit gecikme
      return res.json({
        success: true,
        message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi.',
      });
    }

    // Reset token oluştur
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    // Token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Email gönder (şimdilik console.log)
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    console.log(`📧 Şifre sıfırlama isteği: ${user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi.',
    });
  } catch (error) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    next(error);
  }
}

/**
 * Şifre sıfırlama - Reset token ile yeni şifre belirleme
 */
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Token ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token süresi dolmamış olmalı
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş reset token.',
      });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await hashPassword(password);

    // Şifreyi güncelle ve reset token'ı temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0, // Şifre sıfırlandığında login denemelerini sıfırla
        lockedUntil: null,
      },
    });

    console.log(`✅ Şifre sıfırlandı: ${user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
};
