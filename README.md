# 📚 UzmanGYS Platform

Kamu Sınavları Hazırlık Platformu - Tam teşekküllü, portable ve production-ready bir sınav hazırlık sistemi.

## 🚀 Özellikler

- ✅ **Backend**: Node.js + Express.js + PostgreSQL + Prisma ORM
- ✅ **Frontend**: React.js + React Router
- ✅ **Authentication**: JWT token tabanlı kimlik doğrulama
- ✅ **Güvenlik**: Bcrypt, Helmet.js, Rate Limiting, CORS, Joi Validation
- ✅ **Docker**: Tek komutla çalışan Docker Compose yapılandırması
- ✅ **Database**: PostgreSQL ile güçlü veri yönetimi
- ✅ **Portable**: Kolay kurulum ve taşınabilirlik

## 📋 Gereksinimler

- Docker ve Docker Compose (önerilen)
- VEYA Node.js 18+, PostgreSQL 15+

## 🏃 Hızlı Başlangıç (Docker ile)

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd uzmangys
```

### 2. Environment Variables Ayarlayın

**Backend için:**
```bash
cd backend
cp env.example .env
```

**Frontend için:**
```bash
cd frontend
cp env.example .env
```

**Backend .env dosyasını düzenleyin:**
- Özellikle `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değerlerini değiştirin
- `DATABASE_URL` zaten local PostgreSQL için ayarlı (değiştirmenize gerek yok)

```env
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public
```

### 3. Docker Compose ile Başlatın

```bash
# Proje root dizininde
docker-compose up -d
```

Bu komut sadece PostgreSQL container'ını başlatır.

### 4. Backend'i Local'de Başlatın

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm start
```

Backend http://localhost:5000 adresinde çalışacak.

### 5. Frontend'i Local'de Başlatın

```bash
# Yeni terminal açın
cd frontend
npm install
npm start
```

Frontend http://localhost:3000 adresinde çalışacak.

### 6. Uygulamaya Erişin

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 7. Varsayılan Kullanıcılar

Seed data ile birlikte şu kullanıcılar oluşturulur:

- **Admin**: 
  - Email: `admin@uzmangys.com`
  - Şifre: `admin123`

- **Test Kullanıcısı**:
  - Email: `test@uzmangys.com`
  - Şifre: `test123`

## 🛠️ Manuel Kurulum (Docker'sız PostgreSQL)

Eğer Docker kullanmak istemiyorsanız, PostgreSQL'i manuel kurup aynı adımları takip edebilirsiniz:

### 1. PostgreSQL Kurulumu

PostgreSQL 15+ kurun ve bir veritabanı oluşturun:

```sql
CREATE DATABASE uzmangys;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE uzmangys TO postgres;
```

**Not:** Docker kullanıyorsanız bu adımı atlayın, Docker otomatik oluşturur.

### 2. Backend ve Frontend Kurulumu

Backend ve Frontend kurulumu yukarıdaki adımlarla aynıdır (4. ve 5. adımlar).

## 📊 Veritabanı İşlemleri

### Migration Çalıştırma

```bash
cd backend
npx prisma migrate dev
```

### Seed Data Yükleme

```bash
cd backend
npm run prisma:seed
```

### Prisma Studio (Veritabanı GUI)

```bash
cd backend
npx prisma studio
```
Tarayıcıda http://localhost:5555 adresine gidin.

## 💾 Yedekleme ve Geri Yükleme

### Veritabanı Yedekleme

**Windows (PowerShell):**
```powershell
docker exec uzmangys-postgres pg_dump -U postgres uzmangys > backups\backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Linux/Mac:**
```bash
docker exec uzmangys-postgres pg_dump -U postgres uzmangys > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Veritabanı Geri Yükleme

**Windows (PowerShell):**
```powershell
Get-Content backups\backup_20240101_120000.sql | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
```

**Linux/Mac:**
```bash
cat backups/backup_20240101_120000.sql | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
```

## 🔧 Script Komutları

### Backend Scripts

```bash
cd backend

npm start              # Production server başlat
npm run dev            # Development server (nodemon)
npm run prisma:generate # Prisma client oluştur
npm run prisma:migrate # Migration çalıştır
npm run prisma:seed    # Seed data yükle
npm run prisma:studio  # Prisma Studio aç
```

### Frontend Scripts

```bash
cd frontend

npm start    # Development server
npm run build # Production build
npm test     # Test çalıştır
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/profile` - Kullanıcı bilgileri (Protected)

### Exams
- `GET /api/exams` - Tüm sınavlar
- `GET /api/exams/:id` - Sınav detayı
- `GET /api/exams/topics/list` - Konular
- `GET /api/exams/topics/:id` - Konu detayı
- `GET /api/exams/articles/list?topicId=xxx` - Konu maddeleri
- `GET /api/exams/summaries/list?topicId=xxx` - Konu özetleri

### Questions
- `GET /api/questions` - Sorular (filtreleme ile)
- `GET /api/questions/:id` - Soru detayı
- `GET /api/questions/mixed` - Karışık sorular
- `POST /api/questions/report` - Soru raporla (Protected)

### Results
- `POST /api/results` - Sonuç kaydet (Protected)
- `GET /api/results/stats` - İstatistikler (Protected)
- `GET /api/results/stats/topics` - Konu bazlı istatistikler (Protected)
- `DELETE /api/results/stats` - İstatistikleri sıfırla (Protected)

## 🔒 Güvenlik Özellikleri

- **Bcrypt**: Şifreler hash'lenerek saklanır (10 rounds)
- **JWT**: Access Token (15 dk) + Refresh Token (7 gün)
- **Helmet.js**: HTTP header güvenliği
- **Rate Limiting**: 
  - Login: 5 deneme / 15 dakika
  - Register: 3 kayıt / saat
  - Password Reset: 3 istek / saat
- **CORS**: Cross-origin istek kontrolü
- **Joi Validation**: Girdi doğrulama (Türkçe hata mesajları)
- **XSS Koruması**: Input sanitization
- **SQL Injection**: Prisma ORM ile otomatik koruma
- **Email Enumeration**: Korumalı (timing attack koruması)
- **Hesap Kilitleme**: 5 başarısız denemeden sonra 15 dakika
- **Token Blacklist**: Logout sonrası token geçersizleştirme

## 📁 Klasör Yapısı

```
uzmangys/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controller'lar
│   │   ├── routes/         # Route tanımları
│   │   ├── middleware/     # Middleware'ler
│   │   ├── config/          # Yapılandırmalar
│   │   └── utils/           # Yardımcı fonksiyonlar
│   ├── prisma/
│   │   ├── schema.prisma   # Veritabanı şeması
│   │   └── seed.js         # Seed data scripti
│   ├── server.js           # Ana server dosyası
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React component'leri
│   │   ├── pages/          # Sayfa component'leri
│   │   ├── services/       # API servisleri
│   │   ├── context/        # Context API
│   │   └── App.jsx         # Ana component
│   └── package.json
├── scripts/
│   ├── backup.sh           # Yedekleme scripti
│   ├── restore.sh          # Geri yükleme scripti
│   └── seed.sh            # Seed scripti
├── docker-compose.yml      # Docker yapılandırması
├── .dockerignore
├── .gitignore
└── README.md
```

## 🚢 Deployment

Detaylı deployment rehberi için `DEPLOYMENT.md` dosyasına bakın.

### Hızlı Deployment Seçenekleri

- **Railway**: Otomatik Docker deployment
- **DigitalOcean**: App Platform veya Droplet
- **Heroku**: Container deployment
- **VPS**: Manuel Docker kurulumu
- **cPanel**: Node.js uygulaması olarak

## 🐛 Sorun Giderme

### PostgreSQL Bağlantı Hatası

```bash
# Container'ın çalıştığını kontrol edin
docker ps | grep postgres

# Logları kontrol edin
docker logs uzmangys_postgres
```

### Migration Hataları

```bash
# Migration'ları sıfırlayın
cd backend
npx prisma migrate reset

# Yeniden migration çalıştırın
npx prisma migrate dev
```

### Port Çakışması

`docker-compose.yml` dosyasında port numaralarını değiştirin:

```yaml
ports:
  - "5001:5000"  # Backend için farklı port
  - "3001:3000"  # Frontend için farklı port
```

## 📝 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**UzmanGYS Platform** - Kamu Sınavları Hazırlık Platformu 🎓
