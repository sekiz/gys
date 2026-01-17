// User Controller - Admin kullanıcı yönetimi
const { prisma } = require('../config/database');
const { hashPassword } = require('../utils/bcrypt');

/**
 * Tüm kullanıcıları listele (Admin)
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            examResults: true,
            userPackages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    next(error);
  }
}

/**
 * Tek kullanıcı detayını getir (Admin)
 */
async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        examResults: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            isCorrect: true,
            createdAt: true,
          },
        },
        userPackages: {
          take: 10,
          orderBy: { purchasedAt: 'desc' },
          select: {
            id: true,
            status: true,
            purchasedAt: true,
            exam: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcı güncelle (Admin)
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, password, isActive } = req.body;
    const currentUser = req.user; // Admin kullanıcı

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Admin kendi hesabını silmeye çalışıyorsa engelle
    if (id === currentUser.id && (isActive === false || role !== 'ADMIN')) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı devre dışı bırakamaz veya rolünüzü değiştiremezsiniz.',
      });
    }

    // Güncelleme verilerini hazırla
    const updateData = {};
    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }
    if (email !== undefined && email.trim()) {
      // Email değişiyorsa unique kontrolü yap
      if (email.toLowerCase().trim() !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Bu e-posta adresi zaten kullanılıyor.',
          });
        }
        updateData.email = email.toLowerCase().trim();
      }
    }
    if (role !== undefined) {
      updateData.role = role;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (password !== undefined && password.trim()) {
      // Şifreyi hashle
      updateData.password = await hashPassword(password);
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Kullanıcı güncellendi: ${updatedUser.email} - Admin: ${currentUser.email}`);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi.',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcı sil (Admin)
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user; // Admin kullanıcı

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Admin kendi hesabını silmeye çalışıyorsa engelle
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz.',
      });
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id },
    });

    console.log(`✅ Kullanıcı silindi: ${user.email} - Admin: ${currentUser.email}`);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi.',
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    
    // Foreign key constraint hatası
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıya ait kayıtlar olduğu için silinemez. Önce kullanıcıyı devre dışı bırakabilirsiniz.',
      });
    }
    
    next(error);
  }
}

/**
 * Kullanıcı aktif/pasif durumunu değiştir (Admin)
 */
async function toggleUserActive(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user; // Admin kullanıcı

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Admin kendi hesabını devre dışı bırakmaya çalışıyorsa engelle
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı devre dışı bırakamazsınız.',
      });
    }

    // Durumu değiştir
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Kullanıcı durumu değiştirildi: ${updatedUser.email} (${updatedUser.isActive ? 'Aktif' : 'Pasif'}) - Admin: ${currentUser.email}`);

    res.json({
      success: true,
      message: `Kullanıcı ${updatedUser.isActive ? 'aktif' : 'pasif'} yapıldı.`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Kullanıcı durum değiştirme hatası:', error);
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserActive,
};
