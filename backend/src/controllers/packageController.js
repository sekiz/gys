// Package Controller - Paket satın alma ve yönetimi
const { prisma } = require('../config/database');

/**
 * Kullanıcı paket satın alma talebi oluşturur
 * Admin onayı bekler
 */
async function requestPackage(req, res, next) {
  try {
    const { examId, paymentInfo } = req.body;
    const userId = req.user.id;

    // Exam'in var olup olmadığını kontrol et
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı.',
      });
    }

    if (!exam.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Bu paket şu anda aktif değil.',
      });
    }

    // Kullanıcının bu paketi zaten aktif olarak satın alıp almadığını kontrol et
    const existingPackage = await prisma.userPackage.findFirst({
      where: {
        userId,
        examId,
        status: 'ACTIVE',
      },
    });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Bu pakete zaten sahipsiniz.',
      });
    }

    // Bekleyen bir talebi var mı kontrol et
    const pendingPackage = await prisma.userPackage.findFirst({
      where: {
        userId,
        examId,
        status: 'PENDING',
      },
    });

    if (pendingPackage) {
      return res.status(400).json({
        success: false,
        message: 'Bu paket için zaten bir talep mevcut. Lütfen admin onayını bekleyin.',
      });
    }

    // Yeni paket talebi oluştur
    const userPackage = await prisma.userPackage.create({
      data: {
        userId,
        examId,
        status: 'PENDING',
        // Ödeme bilgileri varsa ekle
        ...(paymentInfo && {
          paymentDate: paymentInfo.paymentDate ? new Date(paymentInfo.paymentDate) : null,
          paymentAmount: paymentInfo.paymentAmount ? parseFloat(paymentInfo.paymentAmount) : null,
          paymentMethod: paymentInfo.paymentMethod || null,
          transactionId: paymentInfo.transactionId || null,
          paymentNotes: paymentInfo.notes || null,
        }),
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📦 Yeni paket talebi: ${req.user.email} - ${exam.name} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Paket talebi oluşturuldu. Admin onayı bekleniyor.',
      data: { userPackage },
    });
  } catch (error) {
    console.error('Paket talebi oluşturma hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcının aktif paketlerini getirir
 */
async function getMyPackages(req, res, next) {
  try {
    const userId = req.user.id;

    const userPackages = await prisma.userPackage.findMany({
      where: {
        userId,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { userPackages },
    });
  } catch (error) {
    console.error('Paketleri getirme hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcının aktif paketini getirir (sadece ACTIVE olan)
 */
async function getMyActivePackage(req, res, next) {
  try {
    const userId = req.user.id;

    const activePackage = await prisma.userPackage.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: {
        activatedAt: 'desc', // En son aktif edilen
      },
    });

    res.json({
      success: true,
      data: { activePackage },
    });
  } catch (error) {
    console.error('Aktif paket getirme hatası:', error);
    next(error);
  }
}

/**
 * Admin: Tüm bekleyen paket taleplerini getirir
 */
async function getPendingPackages(req, res, next) {
  try {
    const pendingPackages = await prisma.userPackage.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { pendingPackages },
    });
  } catch (error) {
    console.error('Bekleyen paketleri getirme hatası:', error);
    next(error);
  }
}

/**
 * Admin: Kullanıcı paketini onaylar (ACTIVE yapar)
 */
async function approvePackage(req, res, next) {
  try {
    const { packageId } = req.params;
    const { notes, expiresAt } = req.body;

    // Paketi bul
    const userPackage = await prisma.userPackage.findUnique({
      where: { id: packageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı.',
      });
    }

    if (userPackage.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Bu paket zaten onaylanmış veya iptal edilmiş.',
      });
    }



    // Paketi aktif yap
    // expiresAt boş string, null veya undefined ise null yap
    let expiresAtDate = null;
    if (expiresAt) {
      // String ise trim yap, değilse direkt Date'e çevir
      const expiresAtValue = typeof expiresAt === 'string' ? expiresAt.trim() : expiresAt;
      if (expiresAtValue !== '' && expiresAtValue !== null) {
        expiresAtDate = new Date(expiresAtValue);
        // Geçersiz tarih kontrolü
        if (isNaN(expiresAtDate.getTime())) {
          expiresAtDate = null;
        }
      }
    }

    // Notes için de güvenli işleme
    const notesValue = notes && typeof notes === 'string' && notes.trim() !== ''
      ? notes.trim()
      : null;

    const updatedPackage = await prisma.userPackage.update({
      where: { id: packageId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: expiresAtDate,
        notes: notesValue,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    console.log(`✅ Paket onaylandı: ${userPackage.user.email} - ${userPackage.exam.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Paket başarıyla onaylandı.',
      data: { userPackage: updatedPackage },
    });
  } catch (error) {
    console.error('Paket onaylama hatası:', error);
    next(error);
  }
}

/**
 * Admin: Kullanıcı paketini reddeder (CANCELLED yapar)
 */
async function rejectPackage(req, res, next) {
  try {
    const { packageId } = req.params;
    const { notes } = req.body;

    // Paketi bul
    const userPackage = await prisma.userPackage.findUnique({
      where: { id: packageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı.',
      });
    }

    if (userPackage.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Bu paket zaten işleme alınmış.',
      });
    }

    // Paketi iptal et
    // Notes için güvenli işleme
    const notesValue = notes && typeof notes === 'string' && notes.trim() !== ''
      ? notes.trim()
      : null;

    const updatedPackage = await prisma.userPackage.update({
      where: { id: packageId },
      data: {
        status: 'CANCELLED',
        notes: notesValue,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    console.log(`❌ Paket reddedildi: ${userPackage.user.email} - ${userPackage.exam.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Paket reddedildi.',
      data: { userPackage: updatedPackage },
    });
  } catch (error) {
    console.error('Paket reddetme hatası:', error);
    next(error);
  }
}

/**
 * Admin: Kullanıcının paketini doğrudan değiştirir (paket satın alma olmadan)
 * userId veya email ile kullanıcı bulunabilir
 */
async function assignPackageToUser(req, res, next) {
  try {
    const { userId, email, examId, expiresAt, notes } = req.body;

    // Kullanıcıyı bul (userId veya email ile)
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'si veya e-posta adresi gereklidir.',
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Exam'i bul
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı.',
      });
    }



    // Yeni paketi oluştur ve aktif yap
    const userPackage = await prisma.userPackage.create({
      data: {
        userId,
        examId,
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    console.log(`✅ Paket atandı: ${user.email} - ${exam.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Paket başarıyla atandı.',
      data: { userPackage },
    });
  } catch (error) {
    console.error('Paket atama hatası:', error);
    next(error);
  }
}

/**
 * Admin: Tüm kullanıcı paketlerini getirir (filtreleme ile)
 */
async function getAllUserPackages(req, res, next) {
  try {
    const { status, userId, examId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (examId) where.examId = examId;

    const userPackages = await prisma.userPackage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { userPackages },
    });
  } catch (error) {
    console.error('Kullanıcı paketlerini getirme hatası:', error);
    next(error);
  }
}

/**
 * Admin: Kullanıcı paketini iptal eder (CANCELLED yapar)
 * Aktif, bekleyen veya süresi dolmuş paketler iptal edilebilir
 */
async function cancelPackage(req, res, next) {
  try {
    const { packageId } = req.params;
    const { notes } = req.body;

    // Paketi bul
    const userPackage = await prisma.userPackage.findUnique({
      where: { id: packageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket bulunamadı.',
      });
    }

    // Zaten iptal edilmişse hata döndür
    if (userPackage.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Bu paket zaten iptal edilmiş.',
      });
    }

    // Paketi iptal et
    // Notes için güvenli işleme
    const notesValue = notes && typeof notes === 'string' && notes.trim() !== ''
      ? notes.trim()
      : null;

    const updatedPackage = await prisma.userPackage.update({
      where: { id: packageId },
      data: {
        status: 'CANCELLED',
        notes: notesValue,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    console.log(`🚫 Paket iptal edildi: ${userPackage.user.email} - ${userPackage.exam.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Paket başarıyla iptal edildi.',
      data: { userPackage: updatedPackage },
    });
  } catch (error) {
    console.error('Paket iptal etme hatası:', error);
    next(error);
  }
}

module.exports = {
  requestPackage,
  getMyPackages,
  getMyActivePackage,
  getPendingPackages,
  approvePackage,
  rejectPackage,
  cancelPackage,
  assignPackageToUser,
  getAllUserPackages,
};
