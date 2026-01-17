# 🖥️ UzmanGYS Platform - Local Kurulum Rehberi

Windows üzerinde local olarak çalıştırma rehberi.

## 📋 Gereksinimler

1. **Docker Desktop for Windows**
   - İndirme: https://www.docker.com/products/docker-desktop
   - Windows 10/11 (64-bit)
   - WSL 2 backend (Docker Desktop otomatik kurar)

2. **Git** (opsiyonel, kodları çekmek için)

## 🚀 Adım Adım Kurulum

### 1. Docker Desktop Kurulumu

1. **Docker Desktop'ı indirin**:
   - https://www.docker.com/products/docker-desktop adresinden indirin
   - `Docker Desktop Installer.exe` dosyasını çalıştırın

2. **Kurulum sırasında**:
   - ✅ "Use WSL 2 instead of Hyper-V" seçeneğini işaretleyin (önerilen)
   - Kurulum tamamlandıktan sonra bilgisayarı yeniden başlatın

3. **Docker Desktop'ı başlatın**:
   - Başlat menüsünden "Docker Desktop"ı açın
   - Sistem tepsisinde Docker ikonunun yeşil olmasını bekleyin
   - İlk açılışta birkaç dakika sürebilir

4. **Kurulumu doğrulayın**:
   ```powershell
   docker --version
   docker-compose --version
   ```

### 2. Projeyi Hazırlama

1. **Proje klasörüne gidin**:
   ```powershell
   cd C:\Users\erkan\Desktop\uzmangys
   ```

2. **Backend .env dosyasını oluşturun**:
   ```powershell
   cd backend
   copy env.example .env
   ```

3. **Frontend .env dosyasını oluşturun**:
   ```powershell
   cd ..\frontend
   copy env.example .env
   ```

4. **Backend .env dosyasını düzenleyin**:
   - Notepad veya herhangi bir editörle `backend\.env` dosyasını açın
   - Özellikle `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değerlerini değiştirin:
   ```env
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-min-32-chars
   ```
   - `DATABASE_URL` zaten local PostgreSQL için ayarlı (değiştirmenize gerek yok)

### 3. PostgreSQL'i Docker ile Başlatma

1. **Proje root dizininde** (uzmangys klasöründe):
   ```powershell
   docker-compose up -d
   ```

   Bu komut sadece PostgreSQL container'ını başlatır.

2. **Container durumunu kontrol edin**:
   ```powershell
   docker-compose ps
   ```

   PostgreSQL servisinin "Up" durumunda olduğunu görmelisiniz.

### 4. Backend'i Local'de Başlatma

1. **Backend klasörüne gidin**:
   ```powershell
   cd backend
   ```

2. **Bağımlılıkları yükleyin**:
   ```powershell
   npm install
   ```

3. **Prisma client'ı oluşturun**:
   ```powershell
   npx prisma generate
   ```

4. **Migration'ları çalıştırın**:
   ```powershell
   npx prisma migrate dev
   ```

5. **Seed data'yı yükleyin** (opsiyonel):
   ```powershell
   npm run prisma:seed
   ```

6. **Backend'i başlatın**:
   ```powershell
   npm start
   # veya development için
   npm run dev
   ```

   Backend http://localhost:5000 adresinde çalışacak.

### 5. Frontend'i Local'de Başlatma

1. **Yeni bir terminal açın ve frontend klasörüne gidin**:
   ```powershell
   cd frontend
   ```

2. **Bağımlılıkları yükleyin**:
   ```powershell
   npm install
   ```

3. **Frontend'i başlatın**:
   ```powershell
   npm start
   ```

   Frontend http://localhost:3000 adresinde çalışacak.

### 6. Uygulamaya Erişim

- **Frontend**: http://localhost:3000 (React dev server)
- **Backend API**: http://localhost:5000 (Node.js server)
- **API Health Check**: http://localhost:5000/health
- **PostgreSQL**: localhost:5432 (Docker container)

### 5. Varsayılan Kullanıcılar

Seed data ile birlikte şu kullanıcılar oluşturulur:

- **Admin Kullanıcı**:
  - Email: `admin@uzmangys.com`
  - Şifre: `admin123`

- **Test Kullanıcısı**:
  - Email: `test@uzmangys.com`
  - Şifre: `test123`

## 🛠️ Kullanışlı Komutlar

### PostgreSQL Container İşlemleri

**Container'ı Durdurma:**
```powershell
docker-compose down
```

**Container'ı Yeniden Başlatma:**
```powershell
docker-compose restart postgres
```

**Logları Görüntüleme:**
```powershell
# PostgreSQL logları
docker-compose logs postgres

# Canlı log takibi
docker-compose logs -f postgres
```

**PostgreSQL Container'ına Giriş:**
```powershell
docker exec -it uzmangys-postgres psql -U postgres -d uzmangys
```

**Backend ve Frontend'i Durdurma:**
- Terminal'lerde `Ctrl+C` ile durdurun

### Veritabanı İşlemleri

**Migration çalıştırma**:
```powershell
cd backend
npx prisma migrate dev
```

**Seed data yükleme**:
```powershell
cd backend
npm run prisma:seed
```

**Prisma Studio (Veritabanı GUI)**:
```powershell
cd backend
npx prisma studio
```
Tarayıcıda http://localhost:5555 adresine gidin.

### Yedekleme ve Geri Yükleme

**Yedekleme** (Windows için):
```powershell
docker exec uzmangys-postgres pg_dump -U postgres uzmangys > backups\backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Geri Yükleme**:
```powershell
Get-Content backups\backup_20240101_120000.sql | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
```

## 🐛 Sorun Giderme

### Docker Desktop Başlamıyor

1. **WSL 2 kontrolü**:
   ```powershell
   wsl --status
   ```
   WSL 2 yüklü değilse:
   ```powershell
   wsl --install
   ```

2. **Hyper-V etkin mi kontrol edin**:
   - Windows Özellikleri'nde "Hyper-V" ve "Windows Subsystem for Linux" etkin olmalı

### Port Çakışması

Eğer 3000 veya 5000 portları kullanılıyorsa, `docker-compose.yml` dosyasında portları değiştirin:

```yaml
ports:
  - "3001:3000"  # Frontend için
  - "5001:5000"  # Backend için
```

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

2. **Veritabanı loglarını kontrol edin**:
   ```powershell
   docker logs uzmangys-postgres
   ```

3. **DATABASE_URL'i kontrol edin**:
   - `backend/.env` dosyasında `DATABASE_URL` doğru mu?
   - Format: `postgresql://postgres:postgres123@localhost:5432/uzmangys`

### Backend Başlamıyor

1. **Port 5000 kullanılıyor mu kontrol edin**:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Node modules'ü temizleyip yeniden yükleyin**:
   ```powershell
   cd backend
   rmdir /s /q node_modules
   npm install
   ```

### Frontend Başlamıyor

1. **Port 3000 kullanılıyor mu kontrol edin**:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Node modules'ü temizleyip yeniden yükleyin**:
   ```powershell
   cd frontend
   rmdir /s /q node_modules
   npm install
   ```

## 📊 Sistem Gereksinimleri

- **RAM**: Minimum 4GB (8GB önerilen)
- **Disk**: Minimum 10GB boş alan
- **CPU**: 2+ core önerilen
- **OS**: Windows 10/11 (64-bit)

## 🔄 Güncelleme

Kodları güncelledikten sonra:

```powershell
# Container'ları durdur
docker-compose down

# Yeniden build et ve başlat
docker-compose up -d --build
```

## 💡 İpuçları

1. **Docker Desktop'ı her zaman çalışır durumda tutun**
2. **İlk build uzun sürebilir, sabırlı olun**
3. **Logları takip ederek sorunları tespit edin**
4. **Düzenli yedek alın**

## 📞 Yardım

Sorun yaşarsanız:
1. Docker Desktop loglarını kontrol edin
2. Container loglarını inceleyin: `docker-compose logs`
3. GitHub issues'da sorun bildirin

---

**Hazır!** Artık projeniz local'de çalışıyor olmalı. 🎉
