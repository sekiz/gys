#!/bin/bash
# Veritabanı yedekleme scripti

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Veritabanı yedekleme başlatılıyor...${NC}"

# Yedek klasörü oluştur
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Tarih ve saat
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/uzmangys_backup_$TIMESTAMP.sql"

# Docker container içinden yedek al
if docker ps | grep -q uzmangys-postgres; then
    docker exec uzmangys-postgres pg_dump -U postgres uzmangys > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Yedek başarıyla alındı: $BACKUP_FILE${NC}"
        
        # Eski yedekleri temizle (30 günden eski)
        find $BACKUP_DIR -name "uzmangys_backup_*.sql" -mtime +30 -delete
        echo -e "${GREEN}🧹 Eski yedekler temizlendi${NC}"
    else
        echo -e "${RED}❌ Yedekleme başarısız!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ PostgreSQL container'ı çalışmıyor!${NC}"
    echo -e "${GREEN}💡 Önce 'docker-compose up -d' komutunu çalıştırın${NC}"
    exit 1
fi
