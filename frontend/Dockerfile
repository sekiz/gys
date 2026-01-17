# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Uygulama dosyalarını kopyala
COPY . .

# Port
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
