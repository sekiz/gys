# 🖥️ UzmanGYS Platform - Yeni Bilgisayara Kurulum Rehberi

Bu rehber, projeyi başka bir bilgisayara kurmak için gerekli tüm adımları içerir.

## 📋 Gereksinimler

### 1. Yazılım Gereksinimleri

- **Node.js** (v18 veya üzeri)
  - İndirme: https://nodejs.org/
  - Kurulum sırasında "Add to PATH" seçeneğini işaretleyin
  - Kurulumu doğrulayın:
    ```powershell
    node --version
    npm --version
    ```

- **Docker Desktop** (PostgreSQL için)
  - İndirme: https://www.docker.com/products/docker-desktop
  - Windows için: Docker Desktop for Windows
  - Kurulum sonrası bilgisayarı yeniden başlatın
  - Docker Desktop'ı açın ve çalıştığını doğrulayın

- **Git** (opsiyonel, kodları çekmek için)
  - İndirme: https://git-scm.com/

### 2. Sistem Gereksinimleri

- **RAM**: Minimum 4GB (8GB önerilen)
- **Disk**: Minimum 10GB boş alan
- **OS**: Windows 10/11 (64-bit) veya Linux/Mac

## 🚀 Adım Adım Kurulum

### Adım 1: Projeyi Kopyalama

#### Seçenek A: Git ile (Önerilen)

```powershell
# Projeyi klonlayın
git clone <repository-url>
cd uzmangys
```

#### Seçenek B: Manuel Kopyalama

1. Proje klasörünü USB veya ağ üzerinden yeni bilgisayara kopyalayın
2. Proje klasörüne gidin:
   ```powershell
   cd C:\Users\KullaniciAdi\Desktop\uzmangys
   ```

### Adım 2: Docker ile PostgreSQL'i Başlatma

1. **Docker Desktop'ı açın** (sistem tepsisinde yeşil ikon olmalı)

2. **PostgreSQL container'ını başlatın**:
   ```powershell
   # Proje root dizininde (uzmangys klasöründe)
   docker-compose up -d
   ```

3. **Container durumunu kontrol edin**:
   ```powershell
   docker-compose ps
   ```
   PostgreSQL servisinin "Up" durumunda olduğunu görmelisiniz.

### Adım 3: Backend Kurulumu

1. **Backend klasörüne gidin**:
   ```powershell
   cd backend
   ```

2. **Environment dosyasını oluşturun**:
   ```powershell
   # Windows PowerShell
   Copy-Item env.example .env
   
   # Veya manuel olarak env.example dosyasını kopyalayıp .env olarak kaydedin
   ```

3. **Backend .env dosyasını düzenleyin**:
   - Notepad veya herhangi bir editörle `backend\.env` dosyasını açın
   - **ÖNEMLİ**: `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değerlerini değiştirin:
     ```env
     JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-min-32-chars-123456789
     JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-min-32-chars-987654321
     ```
   - `DATABASE_URL` zaten doğru ayarlı (değiştirmenize gerek yok):
     ```env
     DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public&connection_limit=200&pool_timeout=30
     ```

4. **Backend bağımlılıklarını yükleyin**:
   ```powershell
   npm install
   ```
   Bu işlem birkaç dakika sürebilir.

5. **Prisma client'ı oluşturun**:
   ```powershell
   npx prisma generate
   ```

6. **Veritabanı migration'larını çalıştırın**:
   ```powershell
   npx prisma migrate dev
   ```
   Bu komut veritabanı tablolarını oluşturur.

7. **Seed data'yı yükleyin** (test verileri için):
   ```powershell
   npm run prisma:seed
   ```
   Bu komut örnek sınavlar, konular, sorular ve kullanıcılar oluşturur.

### Adım 4: Frontend Kurulumu

1. **Yeni bir terminal açın** (backend terminal'ini kapatmayın)

2. **Frontend klasörüne gidin**:
   ```powershell
   cd frontend
   ```

3. **Environment dosyasını oluşturun**:
   ```powershell
   # Windows PowerShell
   Copy-Item env.example .env
   
   # Veya manuel olarak env.example dosyasını kopyalayıp .env olarak kaydedin
   ```

4. **Frontend .env dosyasını kontrol edin**:
   - `frontend\.env` dosyasını açın
   - Backend URL'inin doğru olduğundan emin olun:
     ```env
     REACT_APP_API_URL=http://localhost:5000
     ```

5. **Frontend bağımlılıklarını yükleyin**:
   ```powershell
   npm install
   ```
   Bu işlem birkaç dakika sürebilir.

### Adım 5: Uygulamayı Başlatma

#### Backend'i Başlatma

1. **Backend terminal'inde**:
   ```powershell
   cd backend
   npm start
   ```
   
   Veya development modu için:
   ```powershell
   npm run dev
   ```

2. **Backend başarıyla başladığında** şu mesajı görmelisiniz:
   ```
   🚀 Server is running on port 5000
   ✅ Database connected successfully
   ```

#### Frontend'i Başlatma

1. **Yeni bir terminal açın** (backend terminal'ini kapatmayın)

2. **Frontend terminal'inde**:
   ```powershell
   cd frontend
   npm start
   ```

3. **Tarayıcı otomatik açılacak** veya manuel olarak şu adrese gidin:
   - http://localhost:3000

### Adım 6: Uygulamayı Test Etme

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **API Health Check**: http://localhost:5000/health

#### Varsayılan Kullanıcılar

Seed data ile birlikte şu kullanıcılar oluşturulur:

- **Admin Kullanıcı**:
  - Email: `admin@uzmangys.com`
  - Şifre: `admin123`

- **Test Kullanıcısı**:
  - Email: `test@uzmangys.com`
  - Şifre: `test123`

## 🔧 Kullanışlı Komutlar

### PostgreSQL Container İşlemleri

**Container durumunu kontrol etme:**
```powershell
docker-compose ps
```

**Container'ı durdurma:**
```powershell
docker-compose down
```

**Container'ı yeniden başlatma:**
```powershell
docker-compose up -d
```

**PostgreSQL loglarını görüntüleme:**
```powershell
docker-compose logs postgres
```

**PostgreSQL container'ına giriş:**
```powershell
docker exec -it uzmangys-postgres psql -U postgres -d uzmangys
```

### Veritabanı İşlemleri

**Migration çalıştırma:**
```powershell
cd backend
npx prisma migrate dev
```

**Seed data yükleme:**
```powershell
cd backend
npm run prisma:seed
```

**Prisma Studio (Veritabanı GUI):**
```powershell
cd backend
npx prisma studio
```
Tarayıcıda http://localhost:5555 adresine gidin.

### Yedekleme ve Geri Yükleme

**Yedekleme (Windows):**
```powershell
docker exec uzmangys-postgres pg_dump -U postgres uzmangys > backups\backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Geri Yükleme:**
```powershell
Get-Content backups\backup_20240101_120000.sql | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
```

## 🐛 Sorun Giderme

### Docker Desktop Başlamıyor

1. **WSL 2 kontrolü** (Windows için):
   ```powershell
   wsl --status
   ```
   WSL 2 yüklü değilse:
   ```powershell
   wsl --install
   ```
   Bilgisayarı yeniden başlatın.

2. **Hyper-V etkin mi kontrol edin**:
   - Windows Özellikleri'nde "Hyper-V" ve "Windows Subsystem for Linux" etkin olmalı

### Port Çakışması

Eğer 3000 veya 5000 portları kullanılıyorsa:

**Backend portunu değiştirme:**
1. `backend\.env` dosyasını açın
2. `PORT=5000` değerini değiştirin (örn: `PORT=5001`)
3. `frontend\.env` dosyasında `REACT_APP_API_URL=http://localhost:5001` olarak güncelleyin

**Frontend portunu değiştirme:**
1. `frontend\.env` dosyasını oluşturun (yoksa)
2. `PORT=3001` ekleyin
3. Veya başlatırken: `PORT=3001 npm start`

### PostgreSQL Container Başlamıyor

1. **Logları kontrol edin**:
   ```powershell
   docker-compose logs postgres
   ```

2. **Container'ı temizleyip yeniden başlatın**:
   ```powershell
   docker-compose down
   docker volume rm uzmangys_postgres_data
   docker-compose up -d
   ```

### Veritabanı Bağlantı Hatası

1. **PostgreSQL container'ının çalıştığını kontrol edin**:
   ```powershell
   docker ps | findstr postgres
   ```

2. **DATABASE_URL'i kontrol edin**:
   - `backend\.env` dosyasında `DATABASE_URL` doğru mu?
   - Format: `postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public&connection_limit=200&pool_timeout=30`

3. **Container loglarını kontrol edin**:
   ```powershell
   docker logs uzmangys-postgres
   ```

### Backend Başlamıyor

1. **Port 5000 kullanılıyor mu kontrol edin**:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Node modules'ü temizleyip yeniden yükleyin**:
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Prisma client'ı yeniden oluşturun**:
   ```powershell
   npx prisma generate
   ```

### Frontend Başlamıyor

1. **Port 3000 kullanılıyor mu kontrol edin**:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Node modules'ü temizleyip yeniden yükleyin**:
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Cache'i temizleyin**:
   ```powershell
   npm start -- --reset-cache
   ```

### Migration Hataları

1. **Migration'ları sıfırlayın** (DİKKAT: Tüm veriler silinir):
   ```powershell
   cd backend
   npx prisma migrate reset
   ```

2. **Yeniden migration çalıştırın**:
   ```powershell
   npx prisma migrate dev
   ```

3. **Seed data'yı yeniden yükleyin**:
   ```powershell
   npm run prisma:seed
   ```

## 📦 Proje Yapısı

```
uzmangys/
├── backend/              # Backend (Node.js + Express)
│   ├── src/             # Kaynak kodlar
│   ├── prisma/          # Veritabanı şeması ve migration'lar
│   ├── .env            # Backend environment değişkenleri (oluşturulmalı)
│   └── package.json
├── frontend/            # Frontend (React)
│   ├── src/            # Kaynak kodlar
│   ├── .env            # Frontend environment değişkenleri (oluşturulmalı)
│   └── package.json
├── backups/            # Veritabanı yedekleri
├── docker-compose.yml  # Docker yapılandırması
└── README.md
```

## 🔄 Güncelleme

Kodları güncelledikten sonra:

```powershell
# Backend için
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Frontend için
cd frontend
npm install
```

## 💡 İpuçları

1. **Docker Desktop'ı her zaman çalışır durumda tutun**
2. **İlk kurulum uzun sürebilir, sabırlı olun**
3. **Logları takip ederek sorunları tespit edin**
4. **Düzenli yedek alın**
5. **.env dosyalarını asla Git'e commit etmeyin**
6. **Her yeni bilgisayarda JWT secret'larını mutlaka değiştirin**

## ✅ Kurulum Kontrol Listesi

- [ ] Node.js kurulu ve çalışıyor
- [ ] Docker Desktop kurulu ve çalışıyor
- [ ] Proje klasörü kopyalandı
- [ ] Backend .env dosyası oluşturuldu ve düzenlendi
- [ ] Frontend .env dosyası oluşturuldu
- [ ] PostgreSQL container çalışıyor
- [ ] Backend bağımlılıkları yüklendi
- [ ] Frontend bağımlılıkları yüklendi
- [ ] Prisma migration'ları çalıştırıldı
- [ ] Seed data yüklendi
- [ ] Backend başlatıldı (port 5000)
- [ ] Frontend başlatıldı (port 3000)
- [ ] Tarayıcıda uygulama açılıyor
- [ ] Giriş yapılabiliyor

## 📞 Yardım

Sorun yaşarsanız:

1. Docker Desktop loglarını kontrol edin
2. Container loglarını inceleyin: `docker-compose logs`
3. Backend ve Frontend terminal loglarını kontrol edin
4. Bu rehberdeki "Sorun Giderme" bölümüne bakın

---

**Başarılar!** 🎉 Artık projeniz yeni bilgisayarınızda çalışıyor olmalı.
