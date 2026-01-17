# PowerShell Restore Script - Windows için
# Veritabanı geri yükleme scripti

Write-Host "⚠️  UYARI: Bu işlem mevcut veritabanını tamamen silecek!" -ForegroundColor Yellow
$confirm = Read-Host "Devam etmek istiyor musunuz? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ İşlem iptal edildi" -ForegroundColor Red
    exit 1
}

# Yedek dosyası seç
$backupDir = ".\backups"

if ($args.Count -eq 0) {
    Write-Host "📁 Mevcut yedekler:" -ForegroundColor Yellow
    Get-ChildItem -Path $backupDir -Filter "*.sql" | 
        ForEach-Object { Write-Host "  $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" }
    Write-Host ""
    $backupFile = Read-Host "Yedek dosyasının adını girin (tam yol veya sadece dosya adı)"
    
    if (-not $backupFile.StartsWith(".\") -and -not $backupFile.StartsWith("C:")) {
        $backupFile = Join-Path $backupDir $backupFile
    }
} else {
    $backupFile = $args[0]
}

if (-not (Test-Path $backupFile)) {
    Write-Host "❌ Yedek dosyası bulunamadı: $backupFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Veritabanı geri yükleniyor..." -ForegroundColor Green

# Docker container kontrolü
$containerRunning = docker ps --filter "name=uzmangys-postgres" --format "{{.Names}}"

if ($containerRunning -eq "uzmangys-postgres") {
    # Önce veritabanını temizle
    docker exec uzmangys-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS uzmangys;"
    docker exec uzmangys-postgres psql -U postgres -d postgres -c "CREATE DATABASE uzmangys;"
    
    # Yedeği geri yükle
    Get-Content $backupFile | docker exec -i uzmangys-postgres psql -U postgres -d uzmangys
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Veritabanı başarıyla geri yüklendi!" -ForegroundColor Green
        Write-Host "💡 Prisma migration'ları çalıştırmanız gerekebilir:" -ForegroundColor Yellow
        Write-Host "   cd backend && npx prisma migrate deploy" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Geri yükleme başarısız!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ PostgreSQL container'ı çalışmıyor!" -ForegroundColor Red
    exit 1
}
