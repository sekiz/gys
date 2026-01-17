# 300 Eşzamanlı Kullanıcı Performans Analizi

## 🔍 Mevcut Durum

### ✅ İyi Olanlar
- Rate limiting mevcut
- Prisma ORM kullanılıyor (query optimization)
- Error handling mevcut
- JWT authentication

### ⚠️ Potansiyel Sorunlar

#### 1. **Database Connection Pool** (KRİTİK)
- **Mevcut**: Prisma varsayılan pool (yaklaşık 10-20 connection)
- **Sorun**: 300 kullanıcı için yetersiz olabilir
- **Etki**: Connection timeout hataları, yavaş yanıtlar

#### 2. **Rate Limiting Çok Düşük**
- **Mevcut**: 100 istek / 15 dakika (production)
- **Sorun**: 300 kullanıcı için çok düşük
- **Etki**: Kullanıcılar "çok fazla istek" hatası alabilir

#### 3. **N+1 Query Problemi**
- `getMixedQuestions` fonksiyonunda `excludeSolved` için ayrı query
- Her kullanıcı için çözülmüş sorular ayrı sorgulanıyor
- **Etki**: Database yükü artar

#### 4. **Caching Yok**
- Her istekte database'e gidiyor
- Aynı sorular tekrar tekrar sorgulanıyor
- **Etki**: Gereksiz database yükü

#### 5. **Infinite Scroll Optimizasyonu**
- Her scroll'da API çağrısı
- Debounce/throttle yok
- **Etki**: Gereksiz API çağrıları

## 🚀 Önerilen İyileştirmeler

### 1. Database Connection Pool Yapılandırması (ÖNCELİKLİ)

```javascript
// backend/src/config/database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool ayarları
  // PostgreSQL için önerilen: connection_limit = (max_connections / instance_count) - 2
});

// Prisma connection pool ayarları için .env'e ekle:
// DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=50&pool_timeout=20"
```

**PostgreSQL .env ayarları:**
```env
# Connection pool için
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=50&pool_timeout=20"
```

### 2. Rate Limiting Artırılması

```javascript
// backend/src/middleware/rateLimiter.js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: process.env.NODE_ENV === 'production' ? 500 : 1000, // 300 kullanıcı için yeterli
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 3. Redis Caching Ekleme (ÖNERİLEN)

```bash
npm install redis ioredis
```

```javascript
// backend/src/config/cache.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Cache middleware
async function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();
  
  const key = `cache:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = function(data) {
    redis.setex(key, 300, JSON.stringify(data)); // 5 dakika cache
    res.sendResponse(data);
  };
  
  next();
}

module.exports = { redis, cacheMiddleware };
```

### 4. Query Optimizasyonu

```javascript
// backend/src/controllers/questionController.js
// excludeSolved için daha verimli query
if (excludeSolvedBool) {
  // JOIN kullanarak tek query'de çöz
  where.NOT = {
    examResults: {
      some: {
        userId: user.id,
      },
    },
  };
}
```

### 5. Infinite Scroll Debounce

```javascript
// frontend/src/pages/MixedQuizPage.jsx
useEffect(() => {
  let timeoutId;
  const handleScroll = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!loadingMore && hasMore && !loading) {
          loadMoreQuestions();
        }
      }
    }, 200); // 200ms debounce
  };

  window.addEventListener('scroll', handleScroll);
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('scroll', handleScroll);
  };
}, [loadingMore, hasMore, loading]);
```

### 6. Database Indexing (ÖNEMLİ)

```sql
-- PostgreSQL için önerilen indexler
CREATE INDEX idx_question_active_type ON "Question"(is_active, type) WHERE is_active = true;
CREATE INDEX idx_question_topic ON "Question"(topic_id);
CREATE INDEX idx_exam_result_user_question ON "ExamResult"(user_id, question_id);
CREATE INDEX idx_exam_result_user ON "ExamResult"(user_id);
```

### 7. Load Balancing (Production için)

- PM2 cluster mode kullan
- Nginx reverse proxy
- Multiple Node.js instances

```bash
# PM2 ile cluster mode
pm2 start server.js -i max --name uzmangys-api
```

## 📊 Beklenen Performans

### Mevcut Durum (Optimizasyon olmadan)
- **300 kullanıcı**: ⚠️ Sorun yaşanabilir
- **Connection pool**: Yetersiz
- **Response time**: 500-2000ms
- **Hata oranı**: %5-10

### Optimizasyon Sonrası
- **300 kullanıcı**: ✅ Sorunsuz
- **Connection pool**: Yeterli
- **Response time**: 100-500ms (cache ile 50-200ms)
- **Hata oranı**: <%1

## 🎯 Öncelik Sırası

1. **YÜKSEK ÖNCELİK**: Database connection pool ayarları
2. **YÜKSEK ÖNCELİK**: Rate limiting artırılması
3. **ORTA ÖNCELİK**: Redis caching
4. **ORTA ÖNCELİK**: Query optimizasyonu
5. **DÜŞÜK ÖNCELİK**: Infinite scroll debounce
6. **DÜŞÜK ÖNCELİK**: Database indexing

## ⚡ Hızlı Çözüm (Minimum Değişiklik)

Sadece connection pool ve rate limiting'i düzeltmek bile 300 kullanıcıyı kaldırabilir:

1. `.env` dosyasına connection pool ekle
2. Rate limiting'i 500'e çıkar
3. PostgreSQL'de `max_connections` ayarını kontrol et (en az 100)

Bu 3 değişiklik ile sistem 300 kullanıcıyı kaldırabilir, ancak caching ile çok daha iyi performans alınır.
