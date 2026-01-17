// Exam Controller
const { prisma } = require('../config/database');

// Tüm sınavları getir
// Admin'ler tüm sınavları görebilir, normal kullanıcılar sadece aktif paketlerini görebilir
async function getExams(req, res, next) {
  try {
    const user = req.user;
    let exams = [];

    // Admin veya Instructor ise tüm sınavları göster (aktif + pasif)
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      exams = await prisma.exam.findMany({
        // Admin için tüm sınavları göster (aktif ve pasif)
        include: {
          _count: {
            select: {
              topics: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Normal kullanıcılar sadece aktif paketlerini görebilir
      const activePackage = await prisma.userPackage.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
        include: {
          exam: {
            include: {
              _count: {
                select: {
                  topics: true,
                },
              },
            },
          },
        },
      });

      if (activePackage && activePackage.exam.isActive) {
        // Paket süresi dolmuş mu kontrol et
        if (!activePackage.expiresAt || activePackage.expiresAt >= new Date()) {
          exams = [activePackage.exam];
        }
      }
    }

    // Prisma Decimal'ı JavaScript number'a çevir
    const examsWithPrice = exams.map(exam => ({
      ...exam,
      price: exam.price ? parseFloat(exam.price.toString()) : null,
    }));

    res.json({
      success: true,
      data: { exams: examsWithPrice },
    });
  } catch (error) {
    next(error);
  }
}

// Tek bir sınavı getir
async function getExam(req, res, next) {
  try {
    const { id } = req.params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            _count: {
              select: {
                questions: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Sınav bulunamadı',
      });
    }

    // Price'ı number'a çevir (Prisma Decimal'dan)
    const examResponse = {
      ...exam,
      price: exam.price ? parseFloat(exam.price.toString()) : null,
    };

    res.json({
      success: true,
      data: { exam: examResponse },
    });
  } catch (error) {
    next(error);
  }
}

// Konuları getir
// Paket kontrolü yapılır (checkExamPackage middleware ile)
async function getTopics(req, res, next) {
  try {
    const { examId } = req.query;
    const user = req.user;

    // Admin veya Instructor ise tüm konuları göster
    let where = {};
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      // Normal kullanıcılar sadece aktif paketlerinin konularını görebilir
      if (req.userPackage) {
        where.examId = req.userPackage.examId;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Aktif bir paketiniz bulunmamaktadır.',
        });
      }
    } else if (examId) {
      where.examId = examId;
    }

    const topics = await prisma.topic.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            questions: true,
            articles: true,
            summaries: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      data: { topics },
    });
  } catch (error) {
    next(error);
  }
}

// Tek bir konuyu getir
// Paket kontrolü yapılır (checkExamPackage middleware ile)
async function getTopic(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            questions: true,
            articles: true,
            summaries: true,
          },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Konu bulunamadı',
      });
    }

    // Admin veya Instructor değilse, paket kontrolü yap
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      if (!req.userPackage || req.userPackage.examId !== topic.examId) {
        return res.status(403).json({
          success: false,
          message: 'Bu konuya erişim yetkiniz bulunmamaktadır.',
        });
      }
    }

    res.json({
      success: true,
      data: { topic },
    });
  } catch (error) {
    next(error);
  }
}

// Konu maddelerini getir
async function getArticles(req, res, next) {
  try {
    const { topicId } = req.query;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'topicId parametresi gereklidir',
      });
    }

    const articles = await prisma.article.findMany({
      where: { topicId },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      data: { articles },
    });
  } catch (error) {
    next(error);
  }
}

// Konu özetlerini getir
async function getSummaries(req, res, next) {
  try {
    const { topicId } = req.query;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'topicId parametresi gereklidir',
      });
    }

    const summaries = await prisma.summary.findMany({
      where: { topicId },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({
      success: true,
      data: { summaries },
    });
  } catch (error) {
    next(error);
  }
}

// Public: Tüm aktif sınavları getir (landing page için, token gerektirmez)
async function getPublicExams(req, res, next) {
  try {
    const exams = await prisma.exam.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        imageUrl: true,
        price: true,
        updatedAt: true, // Güncelleme tarihi için
        _count: {
          select: {
            topics: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // Güncelleme tarihine göre sırala
      },
    });

    // Prisma Decimal'ı JavaScript number'a çevir
    const examsWithPrice = exams.map(exam => {
      let priceValue = null;
      if (exam.price !== null && exam.price !== undefined) {
        try {
          priceValue = parseFloat(exam.price.toString());
          if (isNaN(priceValue)) {
            priceValue = null;
          }
        } catch (e) {
          console.error(`⚠️ Price parse hatası (${exam.name}):`, e);
          priceValue = null;
        }
      }
      return {
        ...exam,
        price: priceValue,
      };
    });
    
    console.log(`📊 getPublicExams: ${examsWithPrice.length} sınav, price dönüşümü tamamlandı`);
    examsWithPrice.forEach(exam => {
      console.log(`  - ${exam.name}: price = ${exam.price} (type: ${typeof exam.price})`);
    });

    res.json({
      success: true,
      data: { exams: examsWithPrice },
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Yeni sınav oluştur
async function createExam(req, res, next) {
  try {
    const { name, description, code, imageUrl, price, isActive } = req.body;

    // Code'un benzersiz olduğunu kontrol et
    const existingExam = await prisma.exam.findUnique({
      where: { code },
    });

    if (existingExam) {
      return res.status(400).json({
        success: false,
        message: 'Bu kod zaten kullanılıyor. Farklı bir kod seçiniz.',
      });
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        description: description || null,
        code,
        imageUrl: imageUrl || null,
        price: price ? parseFloat(price) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    // Price'ı number'a çevir (Prisma Decimal'dan)
    const examResponse = {
      ...exam,
      price: exam.price ? parseFloat(exam.price.toString()) : null,
    };

    console.log(`✅ Yeni sınav oluşturuldu: ${exam.name} - Price: ${examResponse.price} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Sınav başarıyla oluşturuldu.',
      data: { exam: examResponse },
    });
  } catch (error) {
    console.error('Sınav oluşturma hatası:', error);
    next(error);
  }
}

// Admin: Sınav güncelle
async function updateExam(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, code, imageUrl, price, isActive } = req.body;

    // Sınavı bul
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Sınav bulunamadı.',
      });
    }

    // Code değiştiriliyorsa, benzersizlik kontrolü yap
    if (code && code !== existingExam.code) {
      const codeExists = await prisma.exam.findUnique({
        where: { code },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Bu kod zaten kullanılıyor. Farklı bir kod seçiniz.',
        });
      }
    }

    // Güncelle
    const updateData = {};
    
    console.log(`📥 updateExam - Gelen veriler:`, { name, description, code, imageUrl, price, isActive, isActiveType: typeof isActive });
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (code) updateData.code = code;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined && isActive !== null) {
      // isActive boolean olarak kaydedilmeli
      const isActiveValue = isActive === true || isActive === 'true' || isActive === 1;
      updateData.isActive = isActiveValue;
      console.log(`✅ isActive güncelleniyor: ${isActive} (${typeof isActive}) -> ${isActiveValue} (boolean)`);
    } else {
      console.log(`⚠️ isActive undefined/null, güncelleme yapılmıyor`);
    }
    
    // Price güncellemesi - boş string veya undefined ise null, değilse parseFloat
    if (price !== undefined) {
      console.log(`💰 Price güncelleme - Gelen değer: "${price}" (type: ${typeof price})`);
      if (price === '' || price === null || price === undefined) {
        updateData.price = null;
        console.log(`💰 Price null olarak ayarlandı`);
      } else {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
          console.log(`⚠️ Price geçersiz, null olarak ayarlandı`);
          updateData.price = null;
        } else {
          updateData.price = parsedPrice;
          console.log(`✅ Price ${parsedPrice} olarak ayarlandı`);
        }
      }
    } else {
      console.log(`💰 Price undefined, güncelleme yapılmıyor`);
    }
    
    // updateData boşsa hata döndür
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncellenecek alan bulunamadı.',
      });
    }
    
    console.log(`📝 updateData:`, JSON.stringify(updateData, null, 2));
    
    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    // Price'ı number'a çevir (Prisma Decimal'dan)
    const examResponse = {
      ...exam,
      price: exam.price ? parseFloat(exam.price.toString()) : null,
    };

    console.log(`✅ Sınav güncellendi: ${exam.name} - isActive: ${exam.isActive} - Price: ${examResponse.price} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Sınav başarıyla güncellendi.',
      data: { exam: examResponse },
    });
  } catch (error) {
    console.error('Sınav güncelleme hatası:', error);
    next(error);
  }
}

// Admin: Sınav sil
async function deleteExam(req, res, next) {
  try {
    const { id } = req.params;

    // Sınavı bul
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            topics: true,
            userPackages: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Sınav bulunamadı.',
      });
    }

    // İlişkili veriler varsa uyarı ver
    if (exam._count.topics > 0 || exam._count.userPackages > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu sınavın konuları veya kullanıcı paketleri bulunmaktadır. Önce bunları siliniz veya sınavı pasif yapınız.',
        data: {
          topicsCount: exam._count.topics,
          packagesCount: exam._count.userPackages,
        },
      });
    }

    // Sınavı sil
    await prisma.exam.delete({
      where: { id },
    });

    console.log(`❌ Sınav silindi: ${exam.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Sınav başarıyla silindi.',
    });
  } catch (error) {
    console.error('Sınav silme hatası:', error);
    next(error);
  }
}

// Admin: Yeni konu oluştur
async function createTopic(req, res, next) {
  try {
    const { examId, name, description, order } = req.body;

    // Exam'in var olup olmadığını kontrol et
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Sınav bulunamadı.',
      });
    }

    const topic = await prisma.topic.create({
      data: {
        examId,
        name,
        description: description || null,
        order: order || 0,
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

    console.log(`✅ Yeni konu oluşturuldu: ${topic.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Konu başarıyla oluşturuldu.',
      data: { topic },
    });
  } catch (error) {
    console.error('Konu oluşturma hatası:', error);
    next(error);
  }
}

// Admin: Konu güncelle
async function updateTopic(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Konu bulunamadı.',
      });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
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

    console.log(`✅ Konu güncellendi: ${updatedTopic.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Konu başarıyla güncellendi.',
      data: { topic: updatedTopic },
    });
  } catch (error) {
    console.error('Konu güncelleme hatası:', error);
    next(error);
  }
}

// Admin: Konu sil
async function deleteTopic(req, res, next) {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            questions: true,
            articles: true,
            summaries: true,
          },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Konu bulunamadı.',
      });
    }

    // İlişkili veriler varsa uyarı ver
    if (topic._count.questions > 0 || topic._count.articles > 0 || topic._count.summaries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu konunun soruları, maddeleri veya özetleri bulunmaktadır. Önce bunları siliniz.',
        data: {
          questionsCount: topic._count.questions,
          articlesCount: topic._count.articles,
          summariesCount: topic._count.summaries,
        },
      });
    }

    await prisma.topic.delete({
      where: { id },
    });

    console.log(`❌ Konu silindi: ${topic.name} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Konu başarıyla silindi.',
    });
  } catch (error) {
    console.error('Konu silme hatası:', error);
    next(error);
  }
}

// Admin: Konu anlatımı (Article) oluştur
async function createArticle(req, res, next) {
  try {
    const { topicId, title, content, order } = req.body;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Konu bulunamadı.',
      });
    }

    const article = await prisma.article.create({
      data: {
        topicId,
        title,
        content,
        order: order || 0,
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Yeni konu anlatımı oluşturuldu: ${article.title} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Konu anlatımı başarıyla oluşturuldu.',
      data: { article },
    });
  } catch (error) {
    console.error('Konu anlatımı oluşturma hatası:', error);
    next(error);
  }
}

// Admin: Konu özeti (Summary) oluştur
async function createSummary(req, res, next) {
  try {
    const { topicId, title, content, order } = req.body;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Konu bulunamadı.',
      });
    }

    const summary = await prisma.summary.create({
      data: {
        topicId,
        title,
        content,
        order: order || 0,
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Yeni konu özeti oluşturuldu: ${summary.title} - Admin: ${req.user.email} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Konu özeti başarıyla oluşturuldu.',
      data: { summary },
    });
  } catch (error) {
    console.error('Konu özeti oluşturma hatası:', error);
    next(error);
  }
}

// Admin: Konu anlatımı (Article) güncelle
async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, order } = req.body;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Konu anlatımı bulunamadı.',
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✏️ Konu anlatımı güncellendi: ${updatedArticle.title} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Konu anlatımı başarıyla güncellendi.',
      data: { article: updatedArticle },
    });
  } catch (error) {
    console.error('Konu anlatımı güncelleme hatası:', error);
    next(error);
  }
}

// Admin: Konu anlatımı (Article) sil
async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Konu anlatımı bulunamadı.',
      });
    }

    await prisma.article.delete({
      where: { id },
    });

    console.log(`🗑️ Konu anlatımı silindi: ${article.title} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Konu anlatımı başarıyla silindi.',
    });
  } catch (error) {
    console.error('Konu anlatımı silme hatası:', error);
    next(error);
  }
}

// Admin: Konu özeti (Summary) güncelle
async function updateSummary(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, order } = req.body;

    const summary = await prisma.summary.findUnique({
      where: { id },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Konu özeti bulunamadı.',
      });
    }

    const updatedSummary = await prisma.summary.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✏️ Konu özeti güncellendi: ${updatedSummary.title} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Konu özeti başarıyla güncellendi.',
      data: { summary: updatedSummary },
    });
  } catch (error) {
    console.error('Konu özeti güncelleme hatası:', error);
    next(error);
  }
}

// Admin: Konu özeti (Summary) sil
async function deleteSummary(req, res, next) {
  try {
    const { id } = req.params;

    const summary = await prisma.summary.findUnique({
      where: { id },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Konu özeti bulunamadı.',
      });
    }

    await prisma.summary.delete({
      where: { id },
    });

    console.log(`🗑️ Konu özeti silindi: ${summary.title} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Konu özeti başarıyla silindi.',
    });
  } catch (error) {
    console.error('Konu özeti silme hatası:', error);
    next(error);
  }
}

module.exports = {
  getExams,
  getExam,
  getPublicExams,
  getTopics,
  getTopic,
  getArticles,
  getSummaries,
  createExam,
  updateExam,
  deleteExam,
  createTopic,
  updateTopic,
  deleteTopic,
  createArticle,
  updateArticle,
  deleteArticle,
  createSummary,
  updateSummary,
  deleteSummary,
};
