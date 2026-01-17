# 📮 UzmanGYS Platform - Postman Collection

## 🔐 Authentication API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

---

## 1. KAYIT (Register)

**Endpoint:** `POST /api/auth/register`

**Rate Limit:** 3 istek / saat

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "name": "Test User"
}
```

**Şifre Kuralları:**
- Minimum 8 karakter
- En az 1 büyük harf
- En az 1 küçük harf
- En az 1 rakam
- En az 1 özel karakter (@$!%*?&)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Kayıt başarılı. Hoş geldiniz!",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "role": "STUDENT",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Bu e-posta adresi zaten kullanılıyor."
}
```

---

## 2. GİRİŞ (Login)

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 5 istek / 15 dakika

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "role": "STUDENT",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "E-posta veya şifre hatalı."
}
```

**Hesap Kilitli (423):**
```json
{
  "success": false,
  "message": "Hesabınız 15 dakika süreyle kilitlendi. Çok fazla başarısız giriş denemesi."
}
```

---

## 3. TOKEN YENİLEME (Refresh Token)

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token yenilendi.",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 4. ÇIKIŞ (Logout)

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı."
}
```

---

## 5. MEVCUT KULLANICI BİLGİLERİ (Get Me)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "role": "STUDENT",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 6. ŞİFRE DEĞİŞTİRME (Change Password)

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!@#",
  "newPassword": "NewPassword123!@#"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Şifre başarıyla değiştirildi."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Mevcut şifre hatalı."
}
```

---

## 7. ŞİFREMİ UNUTTUM (Forgot Password)

**Endpoint:** `POST /api/auth/forgot-password`

**Rate Limit:** 3 istek / saat

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderildi."
}
```

**Not:** Email console'da görüntülenir (development). Production'da gerçek email gönderilir.

---

## 8. ŞİFRE SIFIRLAMA (Reset Password)

**Endpoint:** `POST /api/auth/reset-password/:token`

**URL Parameter:**
- `token`: Reset token (email'de gönderilen)

**Request Body:**
```json
{
  "password": "NewPassword123!@#"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Şifre başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Geçersiz veya süresi dolmuş reset token."
}
```

---

## 📝 Postman Environment Variables

Postman'de environment oluşturun:

```json
{
  "base_url": "http://localhost:5000/api",
  "access_token": "",
  "refresh_token": ""
}
```

**Pre-request Script (Login sonrası):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.tokens) {
        pm.environment.set("access_token", jsonData.data.tokens.accessToken);
        pm.environment.set("refresh_token", jsonData.data.tokens.refreshToken);
    }
}
```

**Authorization Header (Protected endpoints için):**
```
Bearer {{access_token}}
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Başarılı Kayıt ve Giriş
1. Register endpoint'ini çağır
2. Access token'ı kaydet
3. `/me` endpoint'ini çağır (token ile)
4. Başarılı olmalı

### Senaryo 2: Geçersiz Şifre Kuralları
1. Register endpoint'ini zayıf şifre ile çağır
2. Validation hatası almalı

### Senaryo 3: Rate Limiting
1. Login endpoint'ini 6 kez yanlış şifre ile çağır
2. 5. denemeden sonra rate limit hatası almalı

### Senaryo 4: Token Refresh
1. Login yap
2. Refresh token endpoint'ini çağır
3. Yeni access token almalı

### Senaryo 5: Şifre Sıfırlama
1. Forgot password endpoint'ini çağır
2. Console'da reset token'ı gör
3. Reset password endpoint'ini token ile çağır
4. Yeni şifre ile login yap

---

## 🔒 Güvenlik Notları

1. **Access Token**: 15 dakika geçerli
2. **Refresh Token**: 7 gün geçerli
3. **Rate Limiting**: Tüm auth endpoint'lerinde aktif
4. **XSS Koruması**: Input sanitization aktif
5. **SQL Injection**: Prisma ORM ile korunuyor
6. **Password Hashing**: Bcrypt (10 rounds)

---

**Not:** Production'da `JWT_SECRET` ve `JWT_REFRESH_SECRET` değerlerini güçlü random string'lerle değiştirin!
