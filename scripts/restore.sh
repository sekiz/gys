#!/bin/bash
# Veritabanı geri yükleme scripti

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  UYARI: Bu işlem mevcut veritabanını tamamen silecek!${NC}"
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ İşlem iptal edildi${NC}"
    exit 1
fi

# Yedek dosyası seç
BACKUP_DIR="./backups"

if [ -z "$1" ]; then
    echo -e "${YELLOW}📁 Mevcut yedekler:${NC}"
    ls -lh $BACKUP_DIR/*.sql 2>/dev/null | awk '{print $9, "(" $5 ")"}'
    echo
    read -p "Yedek dosyasının tam yolunu girin: " BACKUP_FILE
else
    BACKUP_FILE=$1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Yedek dosyası bulunamadı: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 Veritabanı geri yükleniyor...${NC}"

# Docker container içinden geri yükle
if docker ps | grep -q uzmangys-postgres; then
    # Önce veritabanını temizle
    docker exec uzmangys-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS uzmangys;"
    docker exec uzmangys-postgres psql -U postgres -d postgres -c "CREATE DATABASE uzmangys;"
    
    # Yedeği geri yükle
    cat $BACKUP_FILE | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Veritabanı başarıyla geri yüklendi!${NC}"
        echo -e "${YELLOW}💡 Prisma migration'ları çalıştırmanız gerekebilir:${NC}"
        echo "   cd backend && npx prisma migrate deploy"
    else
        echo -e "${RED}❌ Geri yükleme başarısız!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ PostgreSQL container'ı çalışmıyor!${NC}"
    exit 1
fi
