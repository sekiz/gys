// Price kontrol scripti
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrices() {
  try {
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    console.log('📊 Veritabanındaki Price Değerleri:');
    exams.forEach(exam => {
      console.log(`- ${exam.name}: price = ${exam.price} (type: ${typeof exam.price})`);
      if (exam.price) {
        console.log(`  → toString(): ${exam.price.toString()}`);
        console.log(`  → parseFloat: ${parseFloat(exam.price.toString())}`);
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Hata:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkPrices();
