// Veritabanındaki kayıtların topicId durumunu kontrol etme scripti
// node backend/src/scripts/checkTopicIds.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTopicIds() {
  console.log('🔍 TopicId kontrolü başlıyor...\n');

  try {
    // Bugünün başlangıcı (Türkiye saati - UTC+3)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Türkiye saati için offset (UTC+3)
    const turkishOffset = 3 * 60 * 60 * 1000; // 3 saat milisaniye cinsinden
    const todayTurkish = new Date(today.getTime() - turkishOffset);
    
    console.log('🕐 Bugünün başlangıcı (UTC):', today.toISOString());
    console.log('🕐 Bugünün başlangıcı (TR):', new Date(today.getTime() + turkishOffset).toISOString());
    console.log('🕐 Şu anki zaman (UTC):', new Date().toISOString());
    console.log('🕐 Şu anki zaman (TR):', new Date(Date.now() + turkishOffset).toISOString());
    console.log('');

    // Tüm kayıtları al
    const allResults = await prisma.examResult.findMany({
      where: {
        questionId: { not: null },
      },
      include: {
        question: {
          select: {
            id: true,
            topicId: true,
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Toplam kayıt sayısı: ${allResults.length}\n`);

    // Bugünkü kayıtlar (UTC ve TR saati ile)
    const todayResultsUTC = allResults.filter(r => r.createdAt >= today);
    const todayResultsTR = allResults.filter(r => {
      const resultDate = new Date(r.createdAt);
      return resultDate >= todayTurkish;
    });
    
    console.log(`📅 Bugünkü kayıt sayısı (UTC): ${todayResultsUTC.length}`);
    console.log(`📅 Bugünkü kayıt sayısı (TR): ${todayResultsTR.length}\n`);

    // İstatistikler
    let withTopicId = 0;
    let withoutTopicId = 0;
    let withQuestionTopic = 0;
    let withoutQuestionTopic = 0;

    console.log('📋 Kayıt Detayları:\n');
    console.log('─'.repeat(100));

    allResults.slice(0, 20).forEach((result, index) => {
      const hasTopicId = result.topicId !== null;
      const hasQuestionTopic = result.question?.topic !== null;
      const questionTopicId = result.question?.topicId || result.question?.topic?.id;

      if (hasTopicId) withTopicId++;
      else withoutTopicId++;

      if (hasQuestionTopic) withQuestionTopic++;
      else withoutQuestionTopic++;

      const date = new Date(result.createdAt).toLocaleString('tr-TR');
      const isTodayUTC = result.createdAt >= today;
      const isTodayTR = new Date(result.createdAt) >= todayTurkish;
      const isToday = (isTodayUTC || isTodayTR) ? '✅ BUGÜN' : '📅 ESKİ';

      console.log(`\n${index + 1}. Kayıt ID: ${result.id}`);
      console.log(`   Tarih: ${date} ${isToday}`);
      console.log(`   Question ID: ${result.questionId}`);
      console.log(`   Result TopicId: ${result.topicId || '❌ NULL'}`);
      console.log(`   Question TopicId: ${questionTopicId || '❌ NULL'}`);
      console.log(`   Question Topic Name: ${result.question?.topic?.name || '❌ YOK'}`);
      console.log(`   Exam: ${result.exam?.name || '❌ YOK'}`);
      console.log(`   Doğru: ${result.isCorrect ? '✅' : '❌'}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\n📊 ÖZET İSTATİSTİKLER:\n');
    console.log(`✅ TopicId olan kayıtlar: ${withTopicId} (${((withTopicId / allResults.length) * 100).toFixed(1)}%)`);
    console.log(`❌ TopicId olmayan kayıtlar: ${withoutTopicId} (${((withoutTopicId / allResults.length) * 100).toFixed(1)}%)`);
    console.log(`\n✅ Question'da topic olan: ${withQuestionTopic} (${((withQuestionTopic / allResults.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Question'da topic olmayan: ${withoutQuestionTopic} (${((withoutQuestionTopic / allResults.length) * 100).toFixed(1)}%)`);

    // Bugünkü kayıtlar için özet (TR saati)
    if (todayResultsTR.length > 0) {
      let todayWithTopicId = 0;
      let todayWithoutTopicId = 0;
      let todayWithQuestionTopic = 0;

      todayResultsTR.forEach(result => {
        if (result.topicId !== null) todayWithTopicId++;
        else todayWithoutTopicId++;

        if (result.question?.topic !== null) todayWithQuestionTopic++;
      });

      console.log('\n📅 BUGÜNKÜ KAYITLAR ÖZETİ (TR Saati):\n');
      console.log(`✅ TopicId olan: ${todayWithTopicId}`);
      console.log(`❌ TopicId olmayan: ${todayWithoutTopicId}`);
      console.log(`✅ Question'da topic olan: ${todayWithQuestionTopic}`);
      
      // Bugünkü kayıtların detayları
      console.log('\n📋 BUGÜNKÜ KAYITLARIN DETAYLARI:\n');
      todayResultsTR.slice(0, 10).forEach((result, index) => {
        console.log(`${index + 1}. ID: ${result.id}`);
        console.log(`   Tarih: ${new Date(result.createdAt).toLocaleString('tr-TR')}`);
        console.log(`   TopicId: ${result.topicId || '❌ NULL'}`);
        console.log(`   Question TopicId: ${result.question?.topicId || '❌ NULL'}`);
        console.log(`   Topic Name: ${result.question?.topic?.name || '❌ YOK'}`);
        console.log('');
      });
    }

    // Düzeltilebilir kayıtlar
    const fixableResults = allResults.filter(r => 
      r.topicId === null && 
      r.question?.topic !== null
    );

    console.log(`\n🔧 Düzeltilebilir kayıt sayısı: ${fixableResults.length}`);
    if (fixableResults.length > 0) {
      console.log('   (Bu kayıtlar question\'dan topicId alınarak güncellenebilir)');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTopicIds();
