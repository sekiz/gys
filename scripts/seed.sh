#!/bin/bash
# Seed data yükleme scripti

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌱 Seed data yükleniyor...${NC}"

# Seed data local'de çalıştırılır
if [ -d "backend" ]; then
    cd backend
    npm run prisma:seed
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Seed data başarıyla yüklendi!${NC}"
    else
        echo -e "${RED}❌ Seed data yükleme başarısız!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Backend klasörü bulunamadı!${NC}"
    exit 1
fi
