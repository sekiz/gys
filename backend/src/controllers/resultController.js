// Result Controller
const { prisma } = require('../config/database');

// Sınav sonucu kaydet
async function saveResult(req, res, next) {
  try {
    const { examId, topicId, questionId, isCorrect, userAnswer, timeSpent } = req.body;
    const userId = req.user.id;

    console.log('📊 Sonuç kaydediliyor:', {
      userId,
      questionId,
      topicId,
      examId,
      isCorrect,
      userAnswer,
    });

    // Eğer topicId yoksa, question'dan al
    let finalTopicId = topicId;
    let finalExamId = examId;

    if (!finalTopicId && questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
          topicId: true,
          topic: {
            select: {
              id: true,
              examId: true,
              exam: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (question && question.topic) {
        finalTopicId = question.topicId || question.topic.id;
        finalExamId = question.topic.examId || question.topic.exam?.id || null;
        console.log('✅ Question\'dan alınan:', { 
          questionId, 
          finalTopicId, 
          finalExamId,
          topicName: question.topic.name 
        });
      } else {
        console.log('⚠️ Question bulunamadı veya topic yok:', questionId);
      }
    }

    const result = await prisma.examResult.create({
      data: {
        userId,
        examId: finalExamId || null,
        topicId: finalTopicId || null,
        questionId,
        isCorrect,
        userAnswer: userAnswer !== undefined ? userAnswer : null,
        timeSpent: timeSpent || null,
      },
    });

    console.log('✅ Sonuç kaydedildi:', {
      resultId: result.id,
      questionId: result.questionId,
      topicId: result.topicId,
      examId: result.examId,
      isCorrect: result.isCorrect,
    });

    res.status(201).json({
      success: true,
      message: 'Sonuç başarıyla kaydedildi',
      data: { result },
    });
  } catch (error) {
    console.error('❌ Sonuç kaydetme hatası:', error);
    next(error);
  }
}

// Kullanıcı istatistiklerini getir (bugün - günlük sıfırlama)
async function getStats(req, res, next) {
  try {
    const userId = req.user.id;
    const { topicId, examId } = req.query;

    // Bugünün başlangıcı (Türkiye saati - UTC+3)
    // Türkiye saatine göre bugünün 00:00:00'ını hesapla
    const now = new Date();
    // Türkiye saati için offset (UTC+3)
    const turkishOffset = 3 * 60 * 60 * 1000; // 3 saat milisaniye cinsinden
    // Şu anki zamanı Türkiye saatine çevir
    const nowTurkish = new Date(now.getTime() + turkishOffset);
    // Bugünün başlangıcını Türkiye saatinde hesapla
    const todayTurkish = new Date(nowTurkish);
    todayTurkish.setUTCHours(0, 0, 0, 0);
    // UTC'ye geri çevir (veritabanı UTC kullanıyor)
    const today = new Date(todayTurkish.getTime() - turkishOffset);
    
    console.log('🕐 İstatistik zaman kontrolü:', {
      nowUTC: now.toISOString(),
      nowTurkish: new Date(now.getTime() + turkishOffset).toISOString(),
      todayStartUTC: today.toISOString(),
      todayStartTurkish: new Date(today.getTime() + turkishOffset).toISOString(),
    });

    const where = {
      userId,
      createdAt: {
        gte: today, // Bugünün başından itibaren
      },
      ...(topicId && { topicId }),
      ...(examId && { examId }),
    };

    const [total, correct, wrong] = await Promise.all([
      prisma.examResult.count({ where }),
      prisma.examResult.count({ where: { ...where, isCorrect: true } }),
      prisma.examResult.count({ where: { ...where, isCorrect: false } }),
    ]);

    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    console.log('📊 İstatistikler getiriliyor:', { userId, total, correct, wrong, today });

    res.json({
      success: true,
      data: {
        stats: {
          total,
          correct,
          wrong,
          successRate,
        },
        period: 'günlük',
      },
    });
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    next(error);
  }
}

// Konu bazlı istatistikler (bugün - günlük sıfırlama)
async function getTopicStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Bugünün başlangıcı (Türkiye saati - UTC+3)
    // Türkiye saatine göre bugünün 00:00:00'ını hesapla
    const now = new Date();
    // Türkiye saati için offset (UTC+3)
    const turkishOffset = 3 * 60 * 60 * 1000; // 3 saat milisaniye cinsinden
    // Şu anki zamanı Türkiye saatine çevir
    const nowTurkish = new Date(now.getTime() + turkishOffset);
    // Bugünün başlangıcını Türkiye saatinde hesapla
    const todayTurkish = new Date(nowTurkish);
    todayTurkish.setUTCHours(0, 0, 0, 0);
    // UTC'ye geri çevir (veritabanı UTC kullanıyor)
    const today = new Date(todayTurkish.getTime() - turkishOffset);
    
    console.log('🕐 Konu istatistikleri zaman kontrolü:', {
      nowUTC: now.toISOString(),
      nowTurkish: new Date(now.getTime() + turkishOffset).toISOString(),
      todayStartUTC: today.toISOString(),
      todayStartTurkish: new Date(today.getTime() + turkishOffset).toISOString(),
    });

    // Tüm sonuçları al (topicId null olsa bile, question'dan alacağız)
    const results = await prisma.examResult.findMany({
      where: {
        userId,
        createdAt: {
          gte: today, // Bugünün başından itibaren
        },
        questionId: { not: null }, // QuestionId olan kayıtlar
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
        question: {
          select: {
            topicId: true,
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log('📊 Konu istatistikleri için sonuçlar:', results.length);
    if (results.length > 0) {
      console.log('📊 İlk sonuç örneği:', JSON.stringify(results[0], null, 2));
    }

    // Konu bazlı grupla ve istatistikleri hesapla
    const topicMap = new Map();
    let skippedCount = 0;

    results.forEach((result, index) => {
      // Önce result.topic'ten al, yoksa question.topic'ten al
      let topic = result.topic;
      let topicId = result.topicId;

      // Eğer topic yoksa, question'dan al
      if (!topic && result.question?.topic) {
        topic = result.question.topic;
        topicId = result.question.topicId || result.question.topic?.id;
        console.log(`✅ Result ${index + 1}: Question'dan topic alındı:`, {
          topicId,
          topicName: topic?.name,
        });
      }

      if (!topic || !topicId) {
        skippedCount++;
        console.log(`⚠️ Result ${index + 1} atlandı - Topic bulunamadı:`, {
          resultId: result.id,
          resultTopicId: result.topicId,
          questionId: result.questionId,
          questionTopicId: result.question?.topicId,
          questionTopic: result.question?.topic,
        });
        return;
      }

      const topicName = topic.name;

      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          id: topicId,
          name: topicName,
          total: 0,
          correct: 0,
          wrong: 0,
        });
      }

      const stat = topicMap.get(topicId);
      stat.total += 1;
      if (result.isCorrect) {
        stat.correct += 1;
      } else {
        stat.wrong += 1;
      }
    });

    // Başarı oranını hesapla ve array'e dönüştür
    const topicStats = Array.from(topicMap.values()).map((stat) => ({
      ...stat,
      successRate: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    }));

    // İsme göre sırala
    topicStats.sort((a, b) => a.name.localeCompare(b.name));

    console.log('📊 Konu istatistikleri (final):', JSON.stringify(topicStats, null, 2));
    console.log('📊 Konu sayısı:', topicStats.length);
    console.log('📊 Atlanan kayıt sayısı:', skippedCount);
    console.log('📊 İşlenen kayıt sayısı:', results.length - skippedCount);

    res.json({
      success: true,
      data: { 
        topicStats,
        period: 'günlük',
      },
    });
  } catch (error) {
    console.error('❌ Konu istatistikleri hatası:', error);
    next(error);
  }
}

// Konu bazlı istatistikler (TÜM ZAMANLAR - Stats sayfası için)
async function getAllTopicStats(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Normal soru çözme sonuçları (ExamResult) - Sadece çoktan seçmeli sorular
    const examResults = await prisma.examResult.findMany({
      where: {
        userId,
        questionId: { not: null },
      },
      include: {
        question: {
          select: {
            id: true,
            type: true,
            topicId: true,
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 2. Deneme sınavı sonuçları (TimedTestResult)
    const practiceExamResults = await prisma.timedTestResult.findMany({
      where: {
        userId,
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
                    topicId: true,
                    topic: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('📊 Tüm zamanlar konu istatistikleri için sonuçlar:', {
      examResults: examResults.length,
      practiceExamResults: practiceExamResults.length,
    });

    // Konu bazlı grupla ve istatistikleri hesapla
    const topicMap = new Map();
    let skippedCount = 0;

    // Normal soru çözme sonuçlarını işle (sadece çoktan seçmeli)
    examResults.forEach((result, index) => {
      // Sadece çoktan seçmeli soruları dahil et
      if (result.question?.type !== 'MULTIPLE_CHOICE') {
        return;
      }

      // Question'dan topic bilgisini al
      let topic = result.question?.topic;
      let topicId = result.question?.topicId || result.question?.topic?.id;

      if (!topic || !topicId) {
        skippedCount++;
        if (index < 5) {
          console.log(`⚠️ ExamResult ${index + 1} atlandı - Topic bulunamadı:`, {
            resultId: result.id,
            questionId: result.questionId,
            questionTopicId: result.question?.topicId,
          });
        }
        return;
      }

      const topicName = topic.name;

      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          id: topicId,
          name: topicName,
          total: 0,
          correct: 0,
          wrong: 0,
        });
      }

      const stat = topicMap.get(topicId);
      stat.total += 1;
      if (result.isCorrect) {
        stat.correct += 1;
      } else {
        stat.wrong += 1;
      }
    });

    // Deneme sınavı sonuçlarını işle
    practiceExamResults.forEach((practiceResult) => {
      try {
        // answers JSON formatında olabilir, parse et
        let answers = practiceResult.answers || {};
        if (typeof answers === 'string') {
          try {
            answers = JSON.parse(answers);
          } catch (e) {
            console.error('Answers parse hatası:', e);
            answers = {};
          }
        }

        // test veya questions null/undefined kontrolü
        if (!practiceResult.test || !practiceResult.test.questions || !Array.isArray(practiceResult.test.questions)) {
          console.warn('Practice result test/questions eksik:', practiceResult.id);
          return;
        }
        
        practiceResult.test.questions.forEach((testQuestion) => {
          // testQuestion veya question null kontrolü
          if (!testQuestion || !testQuestion.question) {
            return;
          }

          const question = testQuestion.question;
          
          // Sadece çoktan seçmeli soruları dahil et
          if (!question.type || question.type !== 'MULTIPLE_CHOICE') {
            return;
          }

          const userAnswer = answers[question.id];
          const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;
          
          // Question'dan topic bilgisini al
          let topic = question.topic;
          let topicId = question.topicId || question.topic?.id;

          if (!topic || !topicId) {
            skippedCount++;
            return;
          }

          const topicName = topic.name;

          if (!topicMap.has(topicId)) {
            topicMap.set(topicId, {
              id: topicId,
              name: topicName,
              total: 0,
              correct: 0,
              wrong: 0,
            });
          }

          const stat = topicMap.get(topicId);
          stat.total += 1;
          if (isCorrect) {
            stat.correct += 1;
          } else {
            stat.wrong += 1;
          }
        });
      } catch (error) {
        console.error('Practice result işleme hatası:', error, practiceResult.id);
        skippedCount++;
      }
    });

    // Başarı oranını hesapla ve array'e dönüştür
    const topicStats = Array.from(topicMap.values()).map((stat) => ({
      ...stat,
      successRate: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    }));

    // İsme göre sırala
    topicStats.sort((a, b) => a.name.localeCompare(b.name));

    console.log('📊 Tüm zamanlar konu istatistikleri (final):', topicStats.length, 'konu');
    console.log('📊 Atlanan kayıt sayısı:', skippedCount);
    const totalProcessed = examResults.length + practiceExamResults.reduce((sum, pr) => sum + (pr.test?.questions?.length || 0), 0);
    console.log('📊 İşlenen kayıt sayısı:', totalProcessed - skippedCount);

    res.json({
      success: true,
      data: { 
        topicStats,
        period: 'tüm zamanlar',
      },
    });
  } catch (error) {
    console.error('❌ Tüm zamanlar konu istatistikleri hatası:', error);
    next(error);
  }
}

// İstatistikleri sıfırla
async function resetStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Hem normal soru çözme sonuçlarını hem de deneme sınavı sonuçlarını sil
    await Promise.all([
      prisma.examResult.deleteMany({
        where: { userId },
      }),
      prisma.timedTestResult.deleteMany({
        where: { userId },
      }),
    ]);

    res.json({
      success: true,
      message: 'İstatistikler başarıyla sıfırlandı',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  saveResult,
  getStats,
  getTopicStats,
  getAllTopicStats,
  resetStats,
};
