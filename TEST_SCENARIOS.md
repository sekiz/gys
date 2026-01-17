# 🧪 UzmanGYS Platform - Test Senaryoları

## 🔐 Authentication Test Senaryoları

### 1. KAYIT (Register) Testleri

#### ✅ Test 1.1: Başarılı Kayıt
**Adımlar:**
1. POST `/api/auth/register`
2. Geçerli email, şifre ve isim gönder
3. Şifre kurallarına uygun şifre kullan

**Beklenen:**
- Status: 201
- Access token ve refresh token dönmeli
- Kullanıcı veritabanında oluşmalı
- Hoş geldin email'i console'da görünmeli

**Test Data:**
```json
{
  "email": "newuser@test.com",
  "password": "Test123!@#",
  "name": "New User"
}
```

#### ❌ Test 1.2: Duplicate Email
**Adımlar:**
1. Aynı email ile iki kez kayıt yap

**Beklenen:**
- İkinci kayıt: Status 409
- Mesaj: "Bu e-posta adresi zaten kullanılıyor."

#### ❌ Test 1.3: Geçersiz Email Formatı
**Adımlar:**
```json
{
  "email": "invalid-email",
  "password": "Test123!@#",
  "name": "Test"
}
```

**Beklenen:**
- Status: 400
- Validation hatası

#### ❌ Test 1.4: Zayıf Şifre
**Test Cases:**
- `"password": "short"` → Minimum 8 karakter hatası
- `"password": "nouppercase123!@#"` → Büyük harf hatası
- `"password": "NOLOWERCASE123!@#"` → Küçük harf hatası
- `"password": "NoNumbers!@#"` → Rakam hatası
- `"password": "NoSpecial123"` → Özel karakter hatası

**Beklenen:**
- Her durumda Status: 400
- İlgili validation hatası mesajı

---

### 2. GİRİŞ (Login) Testleri

#### ✅ Test 2.1: Başarılı Giriş
**Adımlar:**
1. Önce kayıt yap
2. POST `/api/auth/login` ile giriş yap

**Beklenen:**
- Status: 200
- Access token ve refresh token dönmeli
- `lastLogin` güncellenmeli
- `loginAttempts` sıfırlanmalı

#### ❌ Test 2.2: Yanlış Şifre
**Adımlar:**
1. Doğru email, yanlış şifre ile giriş yap

**Beklenen:**
- Status: 401
- `loginAttempts` artmalı
- Console'da başarısız giriş logu

#### ❌ Test 2.3: Hesap Kilitleme
**Adımlar:**
1. 5 kez yanlış şifre ile giriş yap
2. 6. denemede

**Beklenen:**
- 5. denemeden sonra hesap kilitlenmeli
- Status: 423
- `lockedUntil` set edilmeli
- Mesaj: "Hesabınız X dakika süreyle kilitlendi"

#### ❌ Test 2.4: Kilitli Hesap ile Giriş
**Adımlar:**
1. Hesabı kilitle
2. Doğru şifre ile giriş yapmayı dene

**Beklenen:**
- Status: 423
- Kilitlenme mesajı

#### ⚠️ Test 2.5: Rate Limiting
**Adımlar:**
1. Login endpoint'ini 6 kez çağır (herhangi bir sonuçla)

**Beklenen:**
- 6. istekte Status: 429
- Rate limit mesajı

---

### 3. TOKEN YÖNETİMİ Testleri

#### ✅ Test 3.1: Access Token ile Protected Endpoint
**Adımlar:**
1. Login yap
2. Access token ile GET `/api/auth/me` çağır

**Beklenen:**
- Status: 200
- Kullanıcı bilgileri dönmeli

#### ❌ Test 3.2: Geçersiz Token
**Adımlar:**
1. Geçersiz token ile `/api/auth/me` çağır

**Beklenen:**
- Status: 401
- "Geçersiz veya süresi dolmuş token" mesajı

#### ✅ Test 3.3: Token Refresh
**Adımlar:**
1. Login yap
2. Refresh token ile POST `/api/auth/refresh-token` çağır

**Beklenen:**
- Status: 200
- Yeni access token ve refresh token dönmeli
- Eski refresh token geçersiz olmalı

#### ❌ Test 3.4: Süresi Dolmuş Refresh Token
**Adımlar:**
1. Eski/süresi dolmuş refresh token ile refresh yap

**Beklenen:**
- Status: 401
- "Geçersiz veya süresi dolmuş refresh token" mesajı

#### ✅ Test 3.5: Logout
**Adımlar:**
1. Login yap
2. POST `/api/auth/logout` çağır
3. Aynı refresh token ile refresh yapmayı dene

**Beklenen:**
- Logout: Status: 200
- Refresh denemesi: Status: 401 (token blacklist'te)

---

### 4. ŞİFRE İŞLEMLERİ Testleri

#### ✅ Test 4.1: Şifre Değiştirme
**Adımlar:**
1. Login yap
2. PUT `/api/auth/change-password` ile şifre değiştir
3. Yeni şifre ile login yap

**Beklenen:**
- Şifre değiştirme: Status: 200
- Yeni şifre ile login: Status: 200

#### ❌ Test 4.2: Yanlış Mevcut Şifre
**Adımlar:**
1. Login yap
2. Yanlış mevcut şifre ile değiştirmeyi dene

**Beklenen:**
- Status: 401
- "Mevcut şifre hatalı" mesajı

#### ✅ Test 4.3: Şifremi Unuttum Flow
**Adımlar:**
1. POST `/api/auth/forgot-password` çağır
2. Console'da reset token'ı gör
3. POST `/api/auth/reset-password/:token` ile yeni şifre belirle
4. Yeni şifre ile login yap

**Beklenen:**
- Forgot password: Status: 200
- Reset token console'da görünmeli
- Reset password: Status: 200
- Yeni şifre ile login: Status: 200

#### ❌ Test 4.4: Geçersiz Reset Token
**Adımlar:**
1. Geçersiz token ile reset password çağır

**Beklenen:**
- Status: 400
- "Geçersiz veya süresi dolmuş reset token" mesajı

#### ⚠️ Test 4.5: Reset Token Süresi Dolması
**Adımlar:**
1. Reset token oluştur
2. 1 saat+ bekle (veya token expiry'yi manuel değiştir)
3. Reset password çağır

**Beklenen:**
- Status: 400
- Token süresi dolmuş mesajı

---

### 5. GÜVENLİK Testleri

#### ✅ Test 5.1: XSS Koruması
**Adımlar:**
1. Register endpoint'ine XSS payload gönder:
```json
{
  "name": "<script>alert('XSS')</script>",
  "email": "test@test.com",
  "password": "Test123!@#"
}
```

**Beklenen:**
- Input sanitize edilmeli
- Veritabanında HTML encode edilmiş olmalı

#### ✅ Test 5.2: SQL Injection Koruması
**Adımlar:**
1. Email alanına SQL injection payload gönder:
```json
{
  "email": "test@test.com' OR '1'='1",
  "password": "Test123!@#",
  "name": "Test"
}
```

**Beklenen:**
- Prisma ORM ile korunmalı
- SQL injection çalışmamalı

#### ✅ Test 5.3: Email Enumeration Koruması
**Adımlar:**
1. Kayıtlı olmayan email ile forgot password çağır
2. Kayıtlı email ile forgot password çağır

**Beklenen:**
- Her iki durumda da aynı mesaj dönmeli
- Timing farkı minimal olmalı (sabit gecikme)

#### ✅ Test 5.4: Timing Attack Koruması
**Adımlar:**
1. Var olan email ile login yap (yanlış şifre)
2. Var olmayan email ile login yap

**Beklenen:**
- Her iki durumda da benzer response time
- Sabit gecikme eklenmeli

---

### 6. VALIDATION Testleri

#### ❌ Test 6.1: Boş Alanlar
**Test Cases:**
- Email boş
- Şifre boş
- İsim boş

**Beklenen:**
- Her durumda Status: 400
- İlgili validation hatası

#### ❌ Test 6.2: Uzun Input'lar
**Test Cases:**
- İsim 101 karakter
- Email 256 karakter

**Beklenen:**
- Status: 400
- Max length validation hatası

#### ❌ Test 6.3: Özel Karakterler
**Test Cases:**
- Email'de özel karakterler
- İsim'de HTML tag'leri

**Beklenen:**
- Sanitization uygulanmalı
- XSS koruması aktif olmalı

---

## 📊 Test Coverage Hedefleri

- **Unit Tests**: %80+
- **Integration Tests**: %70+
- **Security Tests**: %100
- **Edge Cases**: Tüm senaryolar

---

## 🚀 Test Çalıştırma

### Manuel Test
1. Postman Collection'ı import et
2. Her endpoint'i sırayla test et
3. Senaryoları takip et

### Otomatik Test (Gelecek)
```bash
npm test
```

---

## 📝 Test Checklist

- [ ] Kayıt başarılı
- [ ] Kayıt validation hataları
- [ ] Giriş başarılı
- [ ] Giriş rate limiting
- [ ] Hesap kilitleme
- [ ] Token refresh
- [ ] Logout
- [ ] Şifre değiştirme
- [ ] Şifre sıfırlama
- [ ] XSS koruması
- [ ] SQL injection koruması
- [ ] Email enumeration koruması
- [ ] Timing attack koruması

---

**Not:** Tüm testler production'a geçmeden önce çalıştırılmalıdır!
