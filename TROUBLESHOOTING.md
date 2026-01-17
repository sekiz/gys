# 🔧 Sorun Giderme Rehberi

## Port Çakışması (EADDRINUSE)

### Hata
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Çözüm

**Windows'ta port kullanan process'i bul ve kapat:**

1. **Port'u kullanan process'i bul:**
   ```cmd
   netstat -ano | findstr :5000
   ```
   
   Çıktı örneği:
   ```
   TCP    0.0.0.0:5000    LISTENING    6428
   ```
   
   Son sütundaki sayı Process ID (PID).

2. **Process'i kapat:**
   ```cmd
   taskkill /PID 6428 /F
   ```
   
   `/F` parametresi process'i zorla kapatır.

3. **Alternatif - Tüm Node.js process'lerini kapat:**
   ```cmd
   taskkill /IM node.exe /F
   ```

### Port Değiştirme (Alternatif)

Eğer port'u değiştirmek isterseniz:

1. **Backend .env dosyasını düzenleyin:**
   ```env
   PORT=5001
   ```

2. **Frontend .env dosyasını düzenleyin:**
   ```env
   REACT_APP_API_URL=http://localhost:5001
   ```

---

## Veritabanı Bağlantı Hatası

### Hata
```
❌ Veritabanı bağlantı hatası: ...
```

### Çözüm

1. **PostgreSQL container'ının çalıştığını kontrol edin:**
   ```cmd
   docker ps
   ```
   
   `uzmangys-postgres` container'ı görünmeli.

2. **Container'ı başlatın:**
   ```cmd
   docker-compose up -d
   ```

3. **DATABASE_URL'i kontrol edin:**
   - `backend/.env` dosyasında:
   ```env
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/uzmangys?schema=public
   ```

4. **Migration'ları çalıştırın:**
   ```cmd
   cd backend
   npx prisma migrate dev
   ```

---

## Module Not Found Hatası

### Hata
```
Cannot find module '...'
```

### Çözüm

1. **node_modules'ü temizle ve yeniden yükle:**
   ```cmd
   cd backend
   rmdir /s /q node_modules
   npm install
   ```

---

## Prisma Client Hatası

### Hata
```
@prisma/client did not initialize yet
```

### Çözüm

```cmd
cd backend
npx prisma generate
```

---

## CORS Hatası

### Hata
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

### Çözüm

1. **Backend .env dosyasını kontrol edin:**
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

2. **Frontend URL'ini ekleyin:**
   - Frontend farklı bir port'ta çalışıyorsa, o port'u da ekleyin.

---

## JWT Token Hatası

### Hata
```
JsonWebTokenError: invalid token
```

### Çözüm

1. **JWT_SECRET değerlerini kontrol edin:**
   - `backend/.env` dosyasında `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` tanımlı olmalı
   - Minimum 32 karakter olmalı

2. **Token'ı yenileyin:**
   - Logout yapıp tekrar login olun
   - Veya refresh token endpoint'ini kullanın

---

## Migration Hatası

### Hata
```
Migration failed
```

### Çözüm

1. **Migration'ları sıfırla (DİKKAT: Veriler silinir!):**
   ```cmd
   cd backend
   npx prisma migrate reset
   ```

2. **Yeniden migration çalıştır:**
   ```cmd
   npx prisma migrate dev
   ```

---

## Seed Data Hatası

### Hata
```
Seed hatası: ...
```

### Çözüm

1. **Migration'ların çalıştığından emin olun:**
   ```cmd
   npx prisma migrate dev
   ```

2. **Prisma client'ı generate edin:**
   ```cmd
   npx prisma generate
   ```

3. **Seed'i tekrar çalıştırın:**
   ```cmd
   npm run prisma:seed
   ```

---

## Genel İpuçları

### Logları Kontrol Etme

**Backend logları:**
- Terminal çıktısını kontrol edin
- Hata mesajlarını okuyun

**PostgreSQL logları:**
```cmd
docker logs uzmangys-postgres
```

### Process'leri Kontrol Etme

**Tüm Node.js process'lerini görmek:**
```cmd
tasklist | findstr node
```

**Tüm Node.js process'lerini kapatmak:**
```cmd
taskkill /IM node.exe /F
```

### Port Kontrolü

**Belirli bir port'u kullanan process:**
```cmd
netstat -ano | findstr :5000
```

**Tüm dinleyen portlar:**
```cmd
netstat -ano | findstr LISTENING
```

---

**Sorun devam ederse:** Hata mesajının tamamını paylaşın, birlikte çözelim!
