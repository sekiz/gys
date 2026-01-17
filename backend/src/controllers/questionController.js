// Question Controller
const { prisma } = require('../config/database');

// Tüm soruları getir (filtreleme ile)
// Paket kontrolü yapılır (checkExamPackage middleware ile)
async function getQuestions(req, res, next) {
  try {
    const { topicId, examId, type, difficulty, limit = 50, offset = 0 } = req.query;
    const user = req.user;

    const where = {
      isActive: true,
      ...(topicId && { topicId }),
      ...(type && { type }),
      ...(difficulty && { difficulty }),
    };

    // Admin veya Instructor değilse, sadece aktif paketinin sorularını göster
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      if (req.userPackage) {
        where.topic = {
          examId: req.userPackage.examId,
          ...(topicId && { id: topicId }),
        };
      } else {
        return res.status(403).json({
          success: false,
          message: 'Aktif bir paketiniz bulunmamaktadır.',
        });
      }
    } else if (examId) {
      where.topic = {
        examId,
      };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              exam: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Tek bir soruyu getir
// Paket kontrolü yapılır (checkExamPackage middleware ile)
async function getQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            exam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı',
      });
    }

    // Admin veya Instructor değilse, paket kontrolü yap
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      if (!req.userPackage || req.userPackage.examId !== question.topic.exam.id) {
        return res.status(403).json({
          success: false,
          message: 'Bu soruya erişim yetkiniz bulunmamaktadır.',
        });
      }
    }

    res.json({
      success: true,
      data: { question },
    });
  } catch (error) {
    next(error);
  }
}

// Karışık sorular getir (rastgele)
// Paket kontrolü yapılır (checkExamPackage middleware ile)
async function getMixedQuestions(req, res, next) {
  try {
    const { topicIds, limit = 10, offset = 0, excludeSolved } = req.query;
    const topicIdArray = topicIds ? topicIds.split(',').filter(id => id.trim()) : [];
    const user = req.user;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const excludeSolvedBool = excludeSolved === 'true' || excludeSolved === true;

    const where = {
      isActive: true,
      type: 'MULTIPLE_CHOICE', // Sadece çoktan seçmeli sorular
    };

    // Admin veya Instructor değilse, sadece aktif paketinin sorularını göster
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      if (req.userPackage) {
        where.topic = {
          examId: req.userPackage.examId,
          ...(topicIdArray.length > 0 && {
            id: { in: topicIdArray },
          }),
        };
      } else {
        return res.status(403).json({
          success: false,
          message: 'Aktif bir paketiniz bulunmamaktadır.',
        });
      }
    } else if (topicIdArray.length > 0) {
      where.topicId = {
        in: topicIdArray,
      };
    }

    // Önce seçili konulardaki toplam soru sayısını kontrol et
    const totalQuestionsInTopics = await prisma.question.count({ where });

    // Kullanıcının çözülmüş sorularını al
    const solvedQuestionIds = await prisma.examResult.findMany({
      where: {
        userId: user.id,
        questionId: { not: null },
      },
      select: {
        questionId: true,
      },
      distinct: ['questionId'],
    });

    const solvedIds = solvedQuestionIds
      .map(r => r.questionId)
      .filter(id => id !== null);

    // Seçili konulardaki çözülmüş soru sayısını kontrol et
    let solvedInTopicsCount = 0;
    if (solvedIds.length > 0 && totalQuestionsInTopics > 0) {
      const solvedInTopics = await prisma.examResult.findMany({
        where: {
          userId: user.id,
          questionId: { 
            in: solvedIds,
          },
          question: {
            ...where,
          },
        },
        select: {
          questionId: true,
        },
        distinct: ['questionId'],
      });

      solvedInTopicsCount = solvedInTopics
        .map(r => r.questionId)
        .filter(id => id !== null)
        .length;
    }

    // Eğer seçili konulardaki tüm sorular çözülmüşse, soruları tekrar göster
    // Aksi halde çözülmüş soruları exclude et (aynı soruyu tekrar göstermemek için)
    if (solvedIds.length > 0 && solvedInTopicsCount < totalQuestionsInTopics) {
      // Hala çözülmemiş sorular var, çözülmüş olanları exclude et
      where.id = {
        ...(where.id || {}),
        notIn: solvedIds,
      };
    }
    // Eğer tüm sorular çözülmüşse (solvedInTopicsCount === totalQuestionsInTopics), 
    // where.id ekleme (tüm soruları tekrar göster)

    // Toplam soru sayısını al (exclude edilmiş haliyle veya tüm sorular)
    const total = await prisma.question.count({ where });

    if (total === 0 && totalQuestionsInTopics === 0) {
      // Hiç soru yok
      return res.json({
        success: true,
        data: {
          questions: [],
          pagination: {
            total: 0,
            limit: limitNum,
            offset: offsetNum,
            hasMore: false,
          },
        },
      });
    }

    // Tüm soruları al (sayfalama için)
    const allQuestions = await prisma.question.findMany({
      where,
      include: {
        topic: {
          include: {
            exam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Önce yeni sorular
      },
    });

    // Rastgele karıştır
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    
    // Sayfalama uygula
    const questions = shuffled.slice(offsetNum, offsetNum + limitNum);
    const hasMore = offsetNum + limitNum < total;

    // Format response - topic bilgilerini de ekle
    const formattedQuestions = questions.map(q => {
      const formatted = {
        ...q,
        topic_name: q.topic?.name,
        exam_name: q.topic?.exam?.name,
        exam_code: q.topic?.exam?.code,
        // Topic ve exam bilgilerini de ekle (frontend'de kullanmak için)
        topic: q.topic ? {
          id: q.topic.id,
          name: q.topic.name,
          exam: q.topic.exam ? {
            id: q.topic.exam.id,
            name: q.topic.exam.name,
            code: q.topic.exam.code,
          } : null,
        } : null,
      };
      // isPreviousExam field'ını açıkça ekle (null/undefined kontrolü ile)
      formatted.isPreviousExam = q.isPreviousExam === true;
      
      // Debug: Çıkmış soru kontrolü
      if (q.isPreviousExam === true) {
        console.log(`📌 Çıkmış soru bulundu: ${q.id} - isPreviousExam: ${q.isPreviousExam} (type: ${typeof q.isPreviousExam})`);
      }
      
      return formatted;
    });

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Soru oluştur (Admin/Instructor)
async function createQuestion(req, res, next) {
  try {
    const { topicId, question, type, options, correctAnswer, explanation, difficulty, isPreviousExam } = req.body;

    // TRUE_FALSE tipi için options'ı otomatik ayarla
    let finalOptions = options;
    if (type === 'TRUE_FALSE') {
      finalOptions = ['Doğru', 'Yanlış'];
    }

    const newQuestion = await prisma.question.create({
      data: {
        topicId,
        question,
        type: type || 'MULTIPLE_CHOICE',
        options: finalOptions || [],
        correctAnswer,
        explanation,
        difficulty: difficulty || 'MEDIUM',
        isPreviousExam: isPreviousExam || false,
      },
      include: {
        topic: {
          include: {
            exam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Soru başarıyla oluşturuldu',
      data: { question: newQuestion },
    });
  } catch (error) {
    next(error);
  }
}

// Soru güncelle (Admin/Instructor)
async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { question, type, options, correctAnswer, explanation, difficulty, isActive, isPreviousExam } = req.body;

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı.',
      });
    }

    // TRUE_FALSE tipi için options'ı otomatik ayarla
    let finalOptions = options;
    if (type === 'TRUE_FALSE') {
      finalOptions = ['Doğru', 'Yanlış'];
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(type && { type }),
        ...(options && { options: finalOptions }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(difficulty && { difficulty }),
        ...(isActive !== undefined && { isActive }),
        // isPreviousExam field'ını her zaman güncelle (false olsa bile)
        isPreviousExam: isPreviousExam !== undefined ? Boolean(isPreviousExam) : (existingQuestion.isPreviousExam || false),
      },
      include: {
        topic: {
          include: {
            exam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    console.log(`✏️ Soru güncellendi: ${updatedQuestion.id} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Soru başarıyla güncellendi.',
      data: { question: updatedQuestion },
    });
  } catch (error) {
    console.error('Soru güncelleme hatası:', error);
    next(error);
  }
}

// Soru sil (Admin/Instructor)
async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Soru bulunamadı.',
      });
    }

    await prisma.question.delete({
      where: { id },
    });

    console.log(`🗑️ Soru silindi: ${question.id} - Admin: ${req.user?.email || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Soru başarıyla silindi.',
    });
  } catch (error) {
    console.error('Soru silme hatası:', error);
    next(error);
  }
}

// Soru raporla
async function reportQuestion(req, res, next) {
  try {
    const { questionId, reason, description } = req.body;
    const userId = req.user.id;

    const report = await prisma.questionReport.create({
      data: {
        questionId,
        userId,
        reason,
        description,
      },
      include: {
        question: {
          select: {
            id: true,
            question: true,
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

    res.status(201).json({
      success: true,
      message: 'Soru raporu başarıyla gönderildi',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Tüm soru raporlarını getir
async function getQuestionReports(req, res, next) {
  try {
    const { status } = req.query; // PENDING, REVIEWED, RESOLVED, REJECTED

    const where = {};
    if (status) {
      where.status = status;
    }

    const reports = await prisma.questionReport.findMany({
      where,
      include: {
        question: {
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            correctAnswer: true,
            topic: {
              select: {
                id: true,
                name: true,
                exam: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { reports },
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Rapor durumunu güncelle
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.questionReport.update({
      where: { id },
      data: { status },
      include: {
        question: {
          select: {
            id: true,
            question: true,
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

    res.json({
      success: true,
      message: 'Rapor durumu güncellendi',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuestions,
  getQuestion,
  getMixedQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reportQuestion,
  getQuestionReports,
  updateReportStatus,
};
