# Connection Pool Kurulum Rehberi

## ✅ Yapılan Değişiklikler

1. **env.example** dosyası güncellendi - Connection pool parametreleri eklendi
2. **database.js** dosyası güncellendi - Connection pool bilgilendirme mesajları eklendi

## 🔧 Kurulum Adımları

### 1. .env Dosyasını Güncelleyin

Backend klasöründeki `.env` dosyanızı açın ve `DATABASE_URL` satırını şu şekilde güncelleyin:

```env
# ÖNCE (eski):
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public

# SONRA (yeni - connection pool ile):
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public&connection_limit=50&pool_timeout=20
```

### 2. PostgreSQL max_connections Kontrolü

PostgreSQL'inizin `max_connections` ayarını kontrol edin:

```sql
-- PostgreSQL'e bağlanın ve şu komutu çalıştırın:
SHOW max_connections;
```

**Önerilen ayarlar:**
- `max_connections` en az **100** olmalı
- Connection pool limit'i `max_connections`'ın **%50-70'i** olmalı
- Örnek: `max_connections=100` ise `connection_limit=50` uygun

**Eğer max_connections 100'den azsa:**

PostgreSQL yapılandırma dosyasını düzenleyin (`postgresql.conf`):

```conf
# postgresql.conf dosyasında:
max_connections = 100
```

Değişiklikten sonra PostgreSQL'i yeniden başlatın:
```bash
# Windows (Service olarak çalışıyorsa)
# Services panelinden PostgreSQL'i yeniden başlatın

# Linux/Mac
sudo systemctl restart postgresql
# veya
sudo service postgresql restart
```

### 3. Backend'i Yeniden Başlatın

Connection pool ayarları uygulanması için backend'i yeniden başlatın:

```bash
cd backend
npm start
# veya
node server.js
```

Development modunda başlatırsanız, console'da connection pool bilgilerini göreceksiniz:
```
✅ Veritabanı bağlantısı başarılı
📊 Connection Pool: limit=50, timeout=20s
```

## 📊 Connection Pool Parametreleri Açıklaması

### `connection_limit=50`
- **Ne işe yarar**: Prisma'nın aynı anda açabileceği maksimum database connection sayısı
- **Neden 50**: 300 eşzamanlı kullanıcı için yeterli (ortalama kullanıcı başına 0.17 connection)
- **Daha fazla kullanıcı için**: 500 kullanıcı → 75-100, 1000 kullanıcı → 150-200

### `pool_timeout=20`
- **Ne işe yarar**: Yeni connection almak için beklenen maksimum süre (saniye)
- **Neden 20**: Normal yük altında connection'lar hızlıca alınır, yüksek yük altında biraz beklenebilir

## 🎯 Farklı Senaryolar İçin Öneriler

### Küçük Ölçek (100-200 kullanıcı)
```env
DATABASE_URL=...&connection_limit=30&pool_timeout=15
```

### Orta Ölçek (300-500 kullanıcı) ✅ ŞU ANKİ AYAR
```env
DATABASE_URL=...&connection_limit=50&pool_timeout=20
```

### Büyük Ölçek (500-1000 kullanıcı)
```env
DATABASE_URL=...&connection_limit=75&pool_timeout=25
```

### Çok Büyük Ölçek (1000+ kullanıcı)
```env
DATABASE_URL=...&connection_limit=100&pool_timeout=30
```

**Not**: `connection_limit` değeri PostgreSQL'in `max_connections` değerinden küçük olmalıdır.

## ⚠️ Önemli Notlar

1. **Production'da**: Connection pool ayarlarını mutlaka test edin
2. **Monitoring**: Database connection sayısını izleyin:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```
3. **Yüksek Yük**: Eğer connection timeout hataları alırsanız:
   - `connection_limit` değerini artırın
   - `pool_timeout` değerini artırın
   - PostgreSQL `max_connections` değerini artırın

## 🔍 Sorun Giderme

### "Too many connections" Hatası
- PostgreSQL `max_connections` değerini artırın
- `connection_limit` değerini azaltın

### "Connection timeout" Hatası
- `pool_timeout` değerini artırın (örn: 30)
- Database sunucusunun yükünü kontrol edin

### Yavaş Performans
- Connection pool limit'i yeterli mi kontrol edin
- Database index'lerini kontrol edin
- Redis caching eklemeyi düşünün

## ✅ Test Etme

Connection pool'un düzgün çalıştığını test etmek için:

1. Backend'i başlatın
2. Console'da connection pool bilgilerini kontrol edin
3. Birkaç API isteği gönderin
4. Hata olmadığını doğrulayın

```bash
# Backend console çıktısı:
✅ Veritabanı bağlantısı başarılı
📊 Connection Pool: limit=50, timeout=20s
🚀 Server 5000 portunda çalışıyor
```

## 📚 Ek Kaynaklar

- [Prisma Connection Pool Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
