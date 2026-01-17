# PowerShell Backup Script - Windows için
# Veritabanı yedekleme scripti

Write-Host "🔄 Veritabanı yedekleme başlatılıyor..." -ForegroundColor Green

# Yedek klasörü oluştur
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Tarih ve saat
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\uzmangys_backup_$timestamp.sql"

# Docker container kontrolü
$containerRunning = docker ps --filter "name=uzmangys-postgres" --format "{{.Names}}"

if ($containerRunning -eq "uzmangys-postgres") {
    # Yedek al
    docker exec uzmangys-postgres pg_dump -U postgres uzmangys | Out-File -FilePath $backupFile -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Yedek başarıyla alındı: $backupFile" -ForegroundColor Green
        
        # Eski yedekleri temizle (30 günden eski)
        $cutoffDate = (Get-Date).AddDays(-30)
        Get-ChildItem -Path $backupDir -Filter "uzmangys_backup_*.sql" | 
            Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
            Remove-Item -Force
        
        Write-Host "🧹 Eski yedekler temizlendi" -ForegroundColor Green
    } else {
        Write-Host "❌ Yedekleme başarısız!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ PostgreSQL container'ı çalışmıyor!" -ForegroundColor Red
    exit 1
}
