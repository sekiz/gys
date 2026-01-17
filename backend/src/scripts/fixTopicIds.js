// Eski kayıtların topicId'lerini düzeltme scripti
// node backend/src/scripts/fixTopicIds.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTopicIds() {
  console.log('🔧 TopicId düzeltme işlemi başlıyor...');

  try {
    // topicId null olan tüm kayıtları bul
    const resultsWithoutTopic = await prisma.examResult.findMany({
      where: {
        topicId: null,
        questionId: { not: null },
      },
      include: {
        question: {
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
        },
      },
    });

    console.log(`📊 TopicId null olan kayıt sayısı: ${resultsWithoutTopic.length}`);

    let updated = 0;
    let skipped = 0;

    for (const result of resultsWithoutTopic) {
      if (result.question?.topic) {
        const topicId = result.question.topicId || result.question.topic.id;
        const examId = result.question.topic.examId || result.question.topic.exam?.id || null;

        await prisma.examResult.update({
          where: { id: result.id },
          data: {
            topicId,
            examId,
          },
        });

        updated++;
        console.log(`✅ Güncellendi: ${result.id} -> topicId: ${topicId}`);
      } else {
        skipped++;
        console.log(`⚠️ Atlandı: ${result.id} - topic bulunamadı`);
      }
    }

    console.log(`\n✅ İşlem tamamlandı!`);
    console.log(`   Güncellenen: ${updated}`);
    console.log(`   Atlanan: ${skipped}`);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTopicIds();
