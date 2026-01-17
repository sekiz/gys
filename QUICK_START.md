# ⚡ Hızlı Başlangıç - UzmanGYS Platform

## 🚀 5 Adımda Başlatma

### 1️⃣ Docker Desktop'ı Başlatın
- Docker Desktop uygulamasını açın
- Sistem tepsisinde yeşil ikon görünene kadar bekleyin

### 2️⃣ PostgreSQL'i Başlatın
```powershell
# Proje root dizininde
docker-compose up -d
```

### 3️⃣ Backend'i Hazırlayın ve Başlatın
```powershell
cd backend
copy env.example .env
# .env dosyasını açıp JWT_SECRET değerlerini değiştirin

npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm start
```

### 4️⃣ Frontend'i Hazırlayın ve Başlatın
```powershell
# Yeni terminal açın
cd frontend
copy env.example .env

npm install
npm start
```

### ✅ Hazır!
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

**Giriş Bilgileri:**
- Email: `admin@uzmangys.com`
- Şifre: `admin123`

---

## 🛑 Durdurma

**PostgreSQL:**
```powershell
docker-compose down
```

**Backend ve Frontend:**
- Terminal'lerde `Ctrl+C` ile durdurun

---

## 🔄 Yeniden Başlatma

**PostgreSQL:**
```powershell
docker-compose restart postgres
```

**Backend:**
```powershell
cd backend
npm start
```

**Frontend:**
```powershell
cd frontend
npm start
```

---

## 📊 Logları Görüntüleme

**PostgreSQL:**
```powershell
docker-compose logs -f postgres
```

**Backend ve Frontend:**
- Terminal çıktılarını takip edin

---

Detaylı bilgi için `LOCAL_SETUP.md` dosyasına bakın.
