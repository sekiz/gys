# 🚀 UzmanGYS Platform - Deployment Rehberi

Bu dokümantasyon, UzmanGYS Platform'unu farklı platformlara nasıl deploy edeceğinizi açıklar.

## 📋 İçindekiler

1. [Railway Deployment](#railway-deployment)
2. [DigitalOcean Deployment](#digitalocean-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [VPS Deployment](#vps-deployment)
5. [cPanel Deployment](#cpanel-deployment)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Checklist](#post-deployment-checklist)

## 🚂 Railway Deployment

### Adımlar

1. **Railway hesabı oluşturun**: https://railway.app

2. **Yeni proje oluşturun**:
   - "New Project" → "Deploy from GitHub repo"

3. **PostgreSQL servisi ekleyin**:
   - "New" → "Database" → "PostgreSQL"
   - Connection string'i kopyalayın

4. **Backend servisi ekleyin**:
   - "New" → "GitHub Repo" → Backend klasörünü seçin
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npx prisma migrate deploy && npm start`

5. **Environment Variables**:
   ```
   DATABASE_URL=<railway-postgres-connection-string>
   JWT_SECRET=<your-secret-key>
   NODE_ENV=production
   PORT=5000
   ```

6. **Frontend servisi ekleyin**:
   - "New" → "GitHub Repo" → Frontend klasörünü seçin
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build`

## 🌊 DigitalOcean Deployment

### App Platform ile

1. **DigitalOcean hesabı oluşturun**

2. **App Platform'da yeni app**:
   - "Create App" → GitHub repo seçin

3. **Backend Component**:
   - Type: Web Service
   - Source: `backend/`
   - Build Command: `npm install && npx prisma generate`
   - Run Command: `npx prisma migrate deploy && npm start`
   - Environment Variables: `.env` dosyasındaki değerler

4. **Database Component**:
   - Type: Database
   - PostgreSQL 15

5. **Frontend Component**:
   - Type: Static Site
   - Source: `frontend/`
   - Build Command: `npm install && npm run build`
   - Output Directory: `build`

### Droplet ile (VPS)

Droplet deployment için [VPS Deployment](#vps-deployment) bölümüne bakın.

## 🟣 Heroku Deployment

### Backend

```bash
# Heroku CLI kurulumu
heroku login

# Backend için app oluştur
cd backend
heroku create uzmangys-backend

# PostgreSQL addon ekle
heroku addons:create heroku-postgresql:hobby-dev

# Environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix backend heroku main

# Migration ve seed
heroku run npx prisma migrate deploy
heroku run npm run prisma:seed
```

### Frontend

```bash
# Frontend için app oluştur
cd frontend
heroku create uzmangys-frontend --buildpack https://github.com/mars/create-react-app-buildpack.git

# Environment variables
heroku config:set REACT_APP_API_URL=https://uzmangys-backend.herokuapp.com/api

# Deploy
git subtree push --prefix frontend heroku main
```

## 🖥️ VPS Deployment

### Gereksinimler

- Ubuntu 20.04+ veya benzeri Linux dağıtımı
- Docker ve Docker Compose
- Nginx (reverse proxy için)

### Adımlar

1. **Sunucuya bağlanın**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Docker kurulumu**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Docker Compose kurulumu**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Projeyi klonlayın**:
   ```bash
   git clone <your-repo-url>
   cd uzmangys
   ```

5. **Environment variables ayarlayın**:
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Düzenleyin
   ```

6. **Docker Compose ile başlatın**:
   ```bash
   docker-compose up -d
   ```

7. **Nginx yapılandırması**:
   ```nginx
   # /etc/nginx/sites-available/uzmangys
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

8. **SSL sertifikası (Let's Encrypt)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 📦 cPanel Deployment

### Backend (Node.js App)

1. **Node.js Selector**:
   - cPanel → "Node.js Selector"
   - Node.js versiyonu seçin (18+)
   - Application root: `backend/`
   - Application URL: `/api`
   - Application startup file: `server.js`

2. **Environment Variables**:
   - cPanel → "Node.js Selector" → "Manage"
   - Environment variables ekleyin

3. **Package.json Scripts**:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "postinstall": "npx prisma generate && npx prisma migrate deploy"
     }
   }
   ```

### Frontend (Static Site)

1. **Build oluşturun**:
   ```bash
   cd frontend
   npm run build
   ```

2. **cPanel File Manager**:
   - `public_html/` klasörüne `build/` içeriğini yükleyin

3. **.htaccess** (Apache):
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://api.your-domain.com/api
```

## ✅ Post-Deployment Checklist

- [ ] Environment variables doğru ayarlandı
- [ ] Database migration'ları çalıştırıldı
- [ ] Seed data yüklendi
- [ ] SSL sertifikası kuruldu (production için)
- [ ] CORS ayarları kontrol edildi
- [ ] Rate limiting ayarları kontrol edildi
- [ ] Backup scripti test edildi
- [ ] Health check endpoint'i çalışıyor
- [ ] Frontend API URL'i doğru yapılandırıldı
- [ ] Loglar kontrol edildi

## 🔄 Güncelleme

### Docker ile

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Manuel

```bash
# Backend
cd backend
git pull
npm install
npx prisma migrate deploy
npm start

# Frontend
cd frontend
git pull
npm install
npm run build
```

## 📊 Monitoring

### Health Check

```bash
curl https://your-api-domain.com/health
```

### Log Kontrolü

```bash
# Docker
docker logs uzmangys_backend
docker logs uzmangys_frontend
docker logs uzmangys_postgres

# Manuel
# PM2 veya systemd logları
```

## 🆘 Sorun Giderme

### Database Connection Error

- Connection string'i kontrol edin
- Firewall ayarlarını kontrol edin
- Database'in çalıştığını doğrulayın

### CORS Errors

- `ALLOWED_ORIGINS` environment variable'ını kontrol edin
- Frontend URL'ini ekleyin

### Build Errors

- Node.js versiyonunu kontrol edin (18+)
- `node_modules` klasörünü silip yeniden `npm install` yapın

---

**Not**: Production ortamında mutlaka güçlü `JWT_SECRET` kullanın ve SSL sertifikası kurun!
