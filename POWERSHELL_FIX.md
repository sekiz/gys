# 🔧 PowerShell Execution Policy Hatası Çözümü

Windows PowerShell'de script çalıştırma izinleri kapalı olduğunda bu hata alınır.

## ✅ Hızlı Çözüm

### Yöntem 1: Execution Policy'yi Geçici Olarak Değiştir (Önerilen)

PowerShell'i **Yönetici olarak** açın ve şu komutu çalıştırın:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Onay isterse:** `Y` yazıp Enter'a basın.

### Yöntem 2: Sadece Bu Oturum İçin

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Bu sadece mevcut PowerShell oturumu için geçerlidir.

### Yöntem 3: CMD Kullan (Alternatif)

PowerShell yerine **Command Prompt (CMD)** kullanabilirsiniz:

1. `Win + R` tuşlarına basın
2. `cmd` yazın ve Enter'a basın
3. Proje klasörüne gidin:
   ```cmd
   cd C:\Users\erkan\Desktop\uzmangys\backend
   ```
4. Komutları çalıştırın:
   ```cmd
   npm run dev
   ```

## 🔍 Execution Policy Seviyeleri

- **Restricted**: Hiçbir script çalıştırılamaz (varsayılan)
- **RemoteSigned**: Yerel scriptler çalışır, internet'ten indirilenler imzalı olmalı (önerilen)
- **Unrestricted**: Tüm scriptler çalışır (güvenlik riski)
- **Bypass**: Tüm kontrolleri atla (sadece geçici kullanım)

## ✅ Önerilen Ayarlar

**CurrentUser için (sadece sizin kullanıcınız):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**LocalMachine için (tüm kullanıcılar - Yönetici gerekir):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

## 🧪 Test Etme

Policy'yi değiştirdikten sonra test edin:

```powershell
Get-ExecutionPolicy
```

Çıktı `RemoteSigned` veya `Bypass` olmalı.

## 📝 Notlar

- **RemoteSigned** en güvenli seçenektir
- Yerel scriptleriniz sorunsuz çalışır
- İnternet'ten indirilen scriptler imzalı olmalı
- Bu ayar sadece PowerShell'i etkiler, npm/node komutları normal çalışır

## 🚀 Alternatif: npm'i Doğrudan Çalıştır

Execution policy'yi değiştirmek istemiyorsanız, npm komutlarını doğrudan çalıştırabilirsiniz:

```powershell
node node_modules/.bin/nodemon server.js
```

veya

```cmd
# CMD'de
npm run dev
```

---

**Sorun devam ederse:** CMD kullanın veya execution policy'yi `RemoteSigned` olarak ayarlayın.
