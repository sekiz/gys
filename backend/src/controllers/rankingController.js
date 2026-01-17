// Ranking Controller - Kullanıcı sıralaması
const { prisma } = require('../config/database');

/**
 * Tüm kullanıcıların sıralamasını getir (Admin hariç)
 * Sadece istek yapan kullanıcıyla aynı aktif pakete sahip kullanıcıları gösterir
 */
async function getRankings(req, res, next) {
  try {
    const currentUser = req.user;

    // İstek yapan kullanıcının aktif paketini bul
    const currentUserPackage = await prisma.userPackage.findFirst({
      where: {
        userId: currentUser.id,
        status: 'ACTIVE',
      },
      select: {
        examId: true,
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Eğer kullanıcının aktif paketi yoksa, boş liste döndür
    if (!currentUserPackage || !currentUserPackage.examId) {
      return res.json({
        success: true,
        data: {
          rankings: [],
          message: 'Aktif paketiniz bulunmamaktadır. Sıralamaya dahil olmak için bir paket satın almalısınız.',
        },
      });
    }

    const examId = currentUserPackage.examId;

    // Aynı aktif pakete sahip tüm öğrenci kullanıcılarını getir
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        userPackages: {
          some: {
            examId: examId,
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        userPackages: {
          where: {
            examId: examId,
            status: 'ACTIVE',
          },
          select: {
            examId: true,
            exam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    // Her kullanıcı için istatistikleri hesapla (hepsi aynı sınava sahip)
    const rankings = await Promise.all(
      users.map(async (user) => {
        // Tüm kullanıcılar aynı sınava sahip olduğu için examId'yi direkt kullan
        const examResultsWhere = {
          userId: user.id,
          questionId: { not: null },
          examId: examId, // Sadece bu sınava ait sorular
        };

        // Normal soru çözme sonuçları (sadece çoktan seçmeli)
        const examResults = await prisma.examResult.findMany({
          where: examResultsWhere,
          include: {
            question: {
              select: {
                type: true,
              },
            },
          },
        });

        // Sadece çoktan seçmeli soruları filtrele
        const multipleChoiceResults = examResults.filter(
          (result) => result.question?.type === 'MULTIPLE_CHOICE'
        );

        // Deneme sınavı sonuçları (sadece bu sınava ait)
        const practiceExamWhere = {
          userId: user.id,
          test: {
            examId: examId,
          },
        };

        const practiceExamResults = await prisma.timedTestResult.findMany({
          where: practiceExamWhere,
          include: {
            test: {
              include: {
                questions: {
                  include: {
                    question: {
                      select: {
                        id: true,
                        type: true,
                        correctAnswer: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Normal soru çözme istatistikleri
        let total = multipleChoiceResults.length;
        let correct = multipleChoiceResults.filter((r) => r.isCorrect).length;
        let wrong = multipleChoiceResults.filter((r) => !r.isCorrect).length;

        // Deneme sınavı istatistiklerini ekle
        practiceExamResults.forEach((practiceResult) => {
          const answers = practiceResult.answers || {};
          let parsedAnswers = answers;
          if (typeof answers === 'string') {
            try {
              parsedAnswers = JSON.parse(answers);
            } catch (e) {
              parsedAnswers = {};
            }
          }

          practiceResult.test.questions.forEach((testQuestion) => {
            const question = testQuestion.question;
            if (question && question.type === 'MULTIPLE_CHOICE') {
              const userAnswer = parsedAnswers[question.id];
              const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;
              total += 1;
              if (isCorrect) {
                correct += 1;
              } else {
                wrong += 1;
              }
            }
          });
        });

        // Başarı puanını hesapla
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
          userId: user.id,
          name: user.name,
          city: user.city || '-',
          examName: currentUserPackage.exam.name,
          total,
          correct,
          wrong,
          score,
        };
      })
    );

    // Puanına göre sırala (yüksekten düşüğe), eşitse toplam soru sayısına göre
    rankings.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.total - a.total;
    });

    // Sıralama numarası ekle
    const rankingsWithRank = rankings.map((ranking, index) => ({
      rank: index + 1,
      ...ranking,
    }));

    res.json({
      success: true,
      data: {
        rankings: rankingsWithRank,
      },
    });
  } catch (error) {
    console.error('Sıralama getirme hatası:', error);
    next(error);
  }
}

/**
 * Kullanıcının aktif paketindeki sınava göre site başarı ortalamasını getir
 */
async function getSiteAverage(req, res, next) {
  try {
    const currentUser = req.user;

    // İstek yapan kullanıcının aktif paketini bul
    const currentUserPackage = await prisma.userPackage.findFirst({
      where: {
        userId: currentUser.id,
        status: 'ACTIVE',
      },
      select: {
        examId: true,
      },
    });

    // Eğer kullanıcının aktif paketi yoksa, null döndür
    if (!currentUserPackage || !currentUserPackage.examId) {
      return res.json({
        success: true,
        data: {
          averageScore: null,
          totalUsers: 0,
          message: 'Aktif paketiniz bulunmamaktadır.',
        },
      });
    }

    const examId = currentUserPackage.examId;

    // Aynı aktif pakete sahip tüm öğrenci kullanıcılarını getir
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        userPackages: {
          some: {
            examId: examId,
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return res.json({
        success: true,
        data: {
          averageScore: null,
          totalUsers: 0,
          message: 'Bu pakete sahip başka kullanıcı bulunmamaktadır.',
        },
      });
    }

    const userIds = users.map((u) => u.id);

    // Tüm kullanıcılar için istatistikleri hesapla
    const userStats = await Promise.all(
      userIds.map(async (userId) => {
        // Normal soru çözme sonuçları (sadece çoktan seçmeli)
        const examResults = await prisma.examResult.findMany({
          where: {
            userId,
            questionId: { not: null },
            examId: examId,
          },
          include: {
            question: {
              select: {
                type: true,
              },
            },
          },
        });

        const multipleChoiceResults = examResults.filter(
          (result) => result.question?.type === 'MULTIPLE_CHOICE'
        );

        // Deneme sınavı sonuçları
        const practiceExamResults = await prisma.timedTestResult.findMany({
          where: {
            userId,
            test: {
              examId: examId,
            },
          },
          include: {
            test: {
              include: {
                questions: {
                  include: {
                    question: {
                      select: {
                        id: true,
                        type: true,
                        correctAnswer: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        let total = multipleChoiceResults.length;
        let correct = multipleChoiceResults.filter((r) => r.isCorrect).length;

        practiceExamResults.forEach((practiceResult) => {
          const answers = practiceResult.answers || {};
          let parsedAnswers = answers;
          if (typeof answers === 'string') {
            try {
              parsedAnswers = JSON.parse(answers);
            } catch (e) {
              parsedAnswers = {};
            }
          }

          practiceResult.test.questions.forEach((testQuestion) => {
            const question = testQuestion.question;
            if (question && question.type === 'MULTIPLE_CHOICE') {
              const userAnswer = parsedAnswers[question.id];
              const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;
              total += 1;
              if (isCorrect) {
                correct += 1;
              }
            }
          });
        });

        const score = total > 0 ? (correct / total) * 100 : 0;
        return { total, correct, score };
      })
    );

    // Ortalama puanı hesapla
    const validScores = userStats.filter((s) => s.total > 0).map((s) => s.score);
    const averageScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;

    res.json({
      success: true,
      data: {
        averageScore,
        totalUsers: users.length,
      },
    });
  } catch (error) {
    console.error('Site ortalaması getirme hatası:', error);
    next(error);
  }
}

module.exports = {
  getRankings,
  getSiteAverage,
};
