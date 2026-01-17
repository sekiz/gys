// Footer Controller - Footer içeriğini yönetme
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Footer içeriğini getir (Public - Herkes görebilir)
 */
async function getFooter(req, res) {
  try {
    let footer = await prisma.footer.findFirst();

    // Eğer footer yoksa varsayılan değerlerle oluştur
    if (!footer) {
      footer = await prisma.footer.create({
        data: {
          description: 'Kamu personeli sınavlarına hazırlanan adaylar için kapsamlı içerik ve soru bankası.',
          email: 'info@uzmangys.com',
          phone: '+90 (XXX) XXX XX XX',
          address: 'Türkiye',
          twitterUrl: 'https://x.com/uzmangys',
          facebookUrl: 'https://facebook.com/uzmangys',
          instagramUrl: 'https://instagram.com/uzmangys',
        },
      });
    }

    res.json({
      success: true,
      data: { footer },
    });
  } catch (error) {
    console.error('Footer getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Footer bilgileri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Footer içeriğini güncelle (Admin only)
 */
async function updateFooter(req, res) {
  try {
    const { description, email, phone, address, twitterUrl, facebookUrl, instagramUrl, privacyPolicyContent, termsContent, mesafeliSatisSozlesmesi, kisiselVerilerIsleme, uyelikSozlesmesi } = req.body;

    // Boş string'leri null'a çevir
    const updateData = {};
    if (description !== undefined) {
      updateData.description = description === '' ? null : description;
    }
    if (email !== undefined) {
      updateData.email = email === '' ? null : email;
    }
    if (phone !== undefined) {
      updateData.phone = phone === '' ? null : phone;
    }
    if (address !== undefined) {
      updateData.address = address === '' ? null : address;
    }
    if (twitterUrl !== undefined) {
      updateData.twitterUrl = twitterUrl === '' ? null : twitterUrl;
    }
    if (facebookUrl !== undefined) {
      updateData.facebookUrl = facebookUrl === '' ? null : facebookUrl;
    }
    if (instagramUrl !== undefined) {
      updateData.instagramUrl = instagramUrl === '' ? null : instagramUrl;
    }
    if (privacyPolicyContent !== undefined) {
      updateData.privacyPolicyContent = privacyPolicyContent === '' ? null : privacyPolicyContent;
    }
    if (termsContent !== undefined) {
      updateData.termsContent = termsContent === '' ? null : termsContent;
    }
    if (mesafeliSatisSozlesmesi !== undefined) {
      updateData.mesafeliSatisSozlesmesi = mesafeliSatisSozlesmesi === '' ? null : mesafeliSatisSozlesmesi;
    }
    if (kisiselVerilerIsleme !== undefined) {
      updateData.kisiselVerilerIsleme = kisiselVerilerIsleme === '' ? null : kisiselVerilerIsleme;
    }
    if (uyelikSozlesmesi !== undefined) {
      updateData.uyelikSozlesmesi = uyelikSozlesmesi === '' ? null : uyelikSozlesmesi;
    }

    // Mevcut footer'ı bul veya oluştur
    let footer = await prisma.footer.findFirst();

    if (!footer) {
      footer = await prisma.footer.create({
        data: {
          ...updateData,
          description: updateData.description || 'Kamu personeli sınavlarına hazırlanan adaylar için kapsamlı içerik ve soru bankası.',
          email: updateData.email || 'info@uzmangys.com',
          phone: updateData.phone || '+90 (XXX) XXX XX XX',
          address: updateData.address || 'Türkiye',
          twitterUrl: updateData.twitterUrl || 'https://x.com/uzmangys',
          facebookUrl: updateData.facebookUrl || 'https://facebook.com/uzmangys',
          instagramUrl: updateData.instagramUrl || 'https://instagram.com/uzmangys',
        },
      });
    } else {
      footer = await prisma.footer.update({
        where: { id: footer.id },
        data: updateData,
      });
    }

    res.json({
      success: true,
      message: 'Footer başarıyla güncellendi',
      data: { footer },
    });
  } catch (error) {
    console.error('Footer güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Footer güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Gizlilik Politikası içeriğini getir (Public)
 */
async function getPrivacyPolicy(req, res) {
  try {
    const footer = await prisma.footer.findFirst();

    if (!footer || !footer.privacyPolicyContent) {
      return res.json({
        success: true,
        data: {
          content: 'Gizlilik politikası içeriği henüz eklenmemiş.',
          title: 'Gizlilik Politikası',
        },
      });
    }

    res.json({
      success: true,
      data: {
        content: footer.privacyPolicyContent,
        title: 'Gizlilik Politikası',
      },
    });
  } catch (error) {
    console.error('Gizlilik politikası getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Gizlilik politikası alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Kullanım Koşulları içeriğini getir (Public)
 */
async function getTerms(req, res) {
  try {
    const footer = await prisma.footer.findFirst();

    if (!footer || !footer.termsContent) {
      return res.json({
        success: true,
        data: {
          content: 'Kullanım koşulları içeriği henüz eklenmemiş.',
          title: 'Kullanım Koşulları',
        },
      });
    }

    res.json({
      success: true,
      data: {
        content: footer.termsContent,
        title: 'Kullanım Koşulları',
      },
    });
  } catch (error) {
    console.error('Kullanım koşulları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanım koşulları alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Mesafeli Satış Sözleşmesi içeriğini getir (Public)
 */
async function getMesafeliSatis(req, res) {
  try {
    const footer = await prisma.footer.findFirst();

    if (!footer || !footer.mesafeliSatisSozlesmesi) {
      return res.json({
        success: true,
        data: {
          content: 'Mesafeli satış sözleşmesi içeriği henüz eklenmemiş.',
          title: 'Mesafeli Satış Sözleşmesi',
        },
      });
    }

    res.json({
      success: true,
      data: {
        content: footer.mesafeliSatisSozlesmesi,
        title: 'Mesafeli Satış Sözleşmesi',
      },
    });
  } catch (error) {
    console.error('Mesafeli satış sözleşmesi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesafeli satış sözleşmesi alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Kişisel Verilerin Kullanılması ve İşlenmesi içeriğini getir (Public)
 */
async function getKisiselVeriler(req, res) {
  try {
    const footer = await prisma.footer.findFirst();

    if (!footer || !footer.kisiselVerilerIsleme) {
      return res.json({
        success: true,
        data: {
          content: 'Kişisel verilerin kullanılması ve işlenmesi içeriği henüz eklenmemiş.',
          title: 'Kişisel Verilerin Kullanılması ve İşlenmesi',
        },
      });
    }

    res.json({
      success: true,
      data: {
        content: footer.kisiselVerilerIsleme,
        title: 'Kişisel Verilerin Kullanılması ve İşlenmesi',
      },
    });
  } catch (error) {
    console.error('Kişisel veriler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kişisel veriler bilgisi alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Üyelik Sözleşmesi içeriğini getir (Public)
 */
async function getUyelikSozlesmesi(req, res) {
  try {
    const footer = await prisma.footer.findFirst();

    if (!footer || !footer.uyelikSozlesmesi) {
      return res.json({
        success: true,
        data: {
          content: 'Üyelik sözleşmesi içeriği henüz eklenmemiş.',
          title: 'Üyelik Sözleşmesi',
        },
      });
    }

    res.json({
      success: true,
      data: {
        content: footer.uyelikSozlesmesi,
        title: 'Üyelik Sözleşmesi',
      },
    });
  } catch (error) {
    console.error('Üyelik sözleşmesi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Üyelik sözleşmesi alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

module.exports = {
  getFooter,
  updateFooter,
  getPrivacyPolicy,
  getTerms,
  getMesafeliSatis,
  getKisiselVeriler,
  getUyelikSozlesmesi,
};
