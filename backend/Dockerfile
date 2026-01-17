# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Prisma CLI'yi global olarak yükle
RUN npm install -g prisma

# Uygulama dosyalarını kopyala
COPY . .

# Prisma client'ı oluştur
RUN npx prisma generate

# Port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Uygulamayı başlat
CMD ["npm", "start"]
