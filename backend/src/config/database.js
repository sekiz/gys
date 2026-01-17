// Veritabanı bağlantı yapılandırması
const { PrismaClient } = require('@prisma/client');

// Connection pool yapılandırması
// Prisma, DATABASE_URL'deki connection_limit ve pool_timeout parametrelerini otomatik kullanır
// Yüksek ölçeklenebilirlik için optimize edilmiş ayarlar:
// - connection_limit: 200 (sınırsız kullanıcı desteği için yüksek limit)
// - pool_timeout: 30 (saniye) - yüksek yük altında daha uzun bekleme
// Bu ayarlar DATABASE_URL'de query string olarak belirtilmelidir:
// postgresql://user:pass@host:5432/db?connection_limit=200&pool_timeout=30
// ÖNEMLİ: PostgreSQL max_connections değerini en az 250 yapmanız önerilir
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool ayarları DATABASE_URL'den otomatik alınır
  // Ekstra yapılandırma gerekirse buraya eklenebilir
});

// Veritabanı bağlantısını test et
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Veritabanı bağlantısı başarılı');
    
    // Connection pool bilgilerini göster
    const dbUrl = process.env.DATABASE_URL || '';
    const connectionLimit = dbUrl.match(/connection_limit=(\d+)/)?.[1] || 'varsayılan';
    const poolTimeout = dbUrl.match(/pool_timeout=(\d+)/)?.[1] || 'varsayılan';
    console.log(`📊 Connection Pool: limit=${connectionLimit}, timeout=${poolTimeout}s (Yüksek ölçeklenebilirlik modu)`);
    
    return prisma;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };
