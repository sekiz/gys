// Practice Exam Controller (Deneme Sınavı)
const { prisma } = require('../config/database');

// Tüm deneme sınavlarını getir (aktif olanlar)
async function getPracticeExams(req, res, next) {
  try {
    const user = req.user;
    let practiceExams = [];

    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      // Admin/Instructor tüm deneme sınavlarını görebilir
      practiceExams = await prisma.timedTest.findMany({
        where: {
          isActive: true,
        },
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Tüm deneme sınavları için kullanıcının son sonuçlarını tek seferde çek
      const examIds = practiceExams.map(exam => exam.id);
      const lastResults = await prisma.timedTestResult.findMany({
        where: {
          testId: { in: examIds },
          userId: user.id,
        },
        orderBy: {
          completedAt: 'desc',
        },
        select: {
          id: true,
          testId: true,
          score: true,
          percentage: true,
          completedAt: true,
        },
      });

      // Her test için en son sonucu bul ve ekle
      const resultsMap = new Map();
      lastResults.forEach(result => {
        if (!resultsMap.has(result.testId)) {
          resultsMap.set(result.testId, {
            id: result.id,
            score: result.score,
            percentage: result.percentage,
            completedAt: result.completedAt,
          });
        }
      });

      practiceExams.forEach(exam => {
        exam.lastResult = resultsMap.get(exam.id) || null;
      });
    } else {
      // Normal kullanıcılar sadece aktif paketlerinin deneme sınavlarını görebilir
      const activePackage = await prisma.userPackage.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
        include: {
          exam: {
            include: {
              timedTests: {
                where: {
                  isActive: true,
                },
                include: {
                  _count: {
                    select: {
                      questions: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      });

      if (activePackage && activePackage.exam) {
        practiceExams = activePackage.exam.timedTests.map(test => ({
          ...test,
          exam: {
            id: activePackage.exam.id,
            name: activePackage.exam.name,
            code: activePackage.exam.code,
          },
        }));

        // Tüm deneme sınavları için kullanıcının son sonuçlarını tek seferde çek
        const examIds = practiceExams.map(exam => exam.id);
        if (examIds.length > 0) {
          const lastResults = await prisma.timedTestResult.findMany({
            where: {
              testId: { in: examIds },
              userId: user.id,
            },
            orderBy: {
              completedAt: 'desc',
            },
            select: {
              id: true,
              testId: true,
              score: true,
              percentage: true,
              completedAt: true,
            },
          });

          // Her test için en son sonucu bul ve ekle
          const resultsMap = new Map();
          lastResults.forEach(result => {
            if (!resultsMap.has(result.testId)) {
              resultsMap.set(result.testId, {
                id: result.id,
                score: result.score,
                percentage: result.percentage,
                completedAt: result.completedAt,
              });
            }
          });

          practiceExams.forEach(exam => {
            exam.lastResult = resultsMap.get(exam.id) || null;
          });
        } else {
          // Eğer deneme sınavı yoksa, lastResult'ı null yap
          practiceExams.forEach(exam => {
            exam.lastResult = null;
          });
        }
      }
    }

    res.json({
      success: true,
      data: { practiceExams },
    });
  } catch (error) {
    next(error);
  }
}

// Belirli bir sınava ait deneme sınavlarını getir (Admin için)
async function getPracticeExamsByExam(req, res, next) {
  try {
    const { examId } = req.params;
    const user = req.user;

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok.',
      });
    }

    const practiceExams = await prisma.timedTest.findMany({
      where: {
        examId,
      },
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { practiceExams },
    });
  } catch (error) {
    next(error);
  }
}

// Tek bir deneme sınavını getir
async function getPracticeExam(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const practiceExam = await prisma.timedTest.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!practiceExam) {
      return res.status(404).json({
        success: false,
        message: 'Deneme sınavı bulunamadı.',
      });
    }

    // Kullanıcı yetkisi kontrolü
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      const activePackage = await prisma.userPackage.findFirst({
        where: {
          userId: user.id,
          examId: practiceExam.examId,
          status: 'ACTIVE',
        },
      });

      if (!activePackage) {
        return res.status(403).json({
          success: false,
          message: 'Bu deneme sınavına erişim yetkiniz yok.',
        });
      }
    }

    if (!practiceExam.isActive && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu deneme sınavı aktif değil.',
      });
    }

    res.json({
      success: true,
      data: { practiceExam },
    });
  } catch (error) {
    next(error);
  }
}

// Deneme sınavı oluştur (Admin)
async function createPracticeExam(req, res, next) {
  try {
    const user = req.user;

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok.',
      });
    }

    const { examId, title, description, duration, questionIds } = req.body;

    if (!examId || !title || !duration || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Eksik veya geçersiz bilgiler.',
      });
    }

    // Exam kontrolü
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Sınav bulunamadı.',
      });
    }

    // Soruların varlığını kontrol et
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        isActive: true,
      },
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Bazı sorular bulunamadı veya aktif değil.',
      });
    }

    // Deneme sınavı oluştur
    const practiceExam = await prisma.timedTest.create({
      data: {
        examId,
        title,
        description: description || null,
        duration: parseInt(duration), // dakika
        questionCount: questionIds.length,
        isActive: true,
        questions: {
          create: questionIds.map((questionId, index) => ({
            questionId,
            order: index,
          })),
        },
      },
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
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Deneme sınavı başarıyla oluşturuldu.',
      data: { practiceExam },
    });
  } catch (error) {
    next(error);
  }
}

// Deneme sınavı güncelle (Admin)
async function updatePracticeExam(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok.',
      });
    }

    const { title, description, duration, questionIds, isActive } = req.body;

    const existingExam = await prisma.timedTest.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Deneme sınavı bulunamadı.',
      });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Sorular güncelleniyorsa
    if (questionIds && Array.isArray(questionIds)) {
      // Önce mevcut soruları sil
      await prisma.timedTestQuestion.deleteMany({
        where: { testId: id },
      });

      // Yeni soruları ekle
      if (questionIds.length > 0) {
        const questions = await prisma.question.findMany({
          where: {
            id: { in: questionIds },
            isActive: true,
          },
        });

        if (questions.length !== questionIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Bazı sorular bulunamadı veya aktif değil.',
          });
        }

        await prisma.timedTestQuestion.createMany({
          data: questionIds.map((questionId, index) => ({
            testId: id,
            questionId,
            order: index,
          })),
        });

        updateData.questionCount = questionIds.length;
      } else {
        updateData.questionCount = 0;
      }
    }

    const practiceExam = await prisma.timedTest.update({
      where: { id },
      data: updateData,
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
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Deneme sınavı başarıyla güncellendi.',
      data: { practiceExam },
    });
  } catch (error) {
    next(error);
  }
}

// Deneme sınavı sil (Admin)
async function deletePracticeExam(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok.',
      });
    }

    const practiceExam = await prisma.timedTest.findUnique({
      where: { id },
    });

    if (!practiceExam) {
      return res.status(404).json({
        success: false,
        message: 'Deneme sınavı bulunamadı.',
      });
    }

    await prisma.timedTest.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Deneme sınavı başarıyla silindi.',
    });
  } catch (error) {
    next(error);
  }
}

// Deneme sınavı sonucunu kaydet
async function submitPracticeExam(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { answers, timeSpent, startedAt } = req.body;

    if (!answers || typeof answers !== 'object' || !timeSpent || !startedAt) {
      return res.status(400).json({
        success: false,
        message: 'Eksik veya geçersiz bilgiler.',
      });
    }

    const practiceExam = await prisma.timedTest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!practiceExam) {
      return res.status(404).json({
        success: false,
        message: 'Deneme sınavı bulunamadı.',
      });
    }

    if (!practiceExam.isActive && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu deneme sınavı aktif değil.',
      });
    }

    // Kullanıcı yetkisi kontrolü
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      const activePackage = await prisma.userPackage.findFirst({
        where: {
          userId: user.id,
          examId: practiceExam.examId,
          status: 'ACTIVE',
        },
      });

      if (!activePackage) {
        return res.status(403).json({
          success: false,
          message: 'Bu deneme sınavına erişim yetkiniz yok.',
        });
      }
    }

    // Cevapları kontrol et ve skor hesapla
    let score = 0;
    const total = practiceExam.questions.length;

    practiceExam.questions.forEach((testQuestion) => {
      const question = testQuestion.question;
      const userAnswer = answers[question.id];

      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
        score++;
      }
    });

    const percentage = total > 0 ? (score / total) * 100 : 0;

    // Sonucu kaydet
    const result = await prisma.timedTestResult.create({
      data: {
        testId: id,
        userId: user.id,
        score,
        total,
        percentage: parseFloat(percentage.toFixed(2)),
        timeSpent: parseInt(timeSpent), // saniye
        answers: answers,
        startedAt: new Date(startedAt),
        completedAt: new Date(),
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            duration: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Deneme sınavı sonucu kaydedildi.',
      data: { result },
    });
  } catch (error) {
    next(error);
  }
}

// Kullanıcının deneme sınavı sonuçlarını getir
async function getPracticeExamResults(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;

    const results = await prisma.timedTestResult.findMany({
      where: {
        testId: id,
        userId: user.id,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10, // Son 10 sonuç
    });

    res.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
}

// Tek bir sonucu detaylı getir (sorularla birlikte)
async function getPracticeExamResultDetail(req, res, next) {
  try {
    const user = req.user;
    const { resultId } = req.params;

    const result = await prisma.timedTestResult.findUnique({
      where: { id: resultId },
      include: {
        test: {
          include: {
            questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    question: true,
                    type: true,
                    options: true,
                    correctAnswer: true,
                    explanation: true,
                    difficulty: true,
                    topic: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Sonuç bulunamadı.',
      });
    }

    // Kullanıcı sadece kendi sonuçlarını görebilir
    if (result.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Bu sonuca erişim yetkiniz yok.',
      });
    }

    res.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPracticeExams,
  getPracticeExamsByExam,
  getPracticeExam,
  createPracticeExam,
  updatePracticeExam,
  deletePracticeExam,
  submitPracticeExam,
  getPracticeExamResults,
  getPracticeExamResultDetail,
};
