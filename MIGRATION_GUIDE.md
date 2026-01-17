# 🔄 Authentication Sistemi Migration Rehberi

Yeni authentication sistemi için veritabanı migration'ı yapılması gerekiyor.

## 📋 Yapılacaklar

### 1. Prisma Schema Güncellemesi

Schema'ya yeni alanlar eklendi:
- `refreshToken` (String?)
- `resetToken` (String?)
- `resetTokenExpiry` (DateTime?)
- `lastLogin` (DateTime?)
- `loginAttempts` (Int, default: 0)
- `lockedUntil` (DateTime?)
- `isActive` (Boolean, default: true)

### 2. Migration Çalıştırma

```bash
# Development
cd backend
npx prisma migrate dev --name add_auth_fields

# Production (Docker)
docker exec uzmangys_backend npx prisma migrate deploy
```

### 3. Environment Variables

`.env` dosyasına ekleyin:

```env
# JWT Secrets (MUTLAKA DEĞİŞTİRİN!)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Token Expiry (opsiyonel)
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
RESET_TOKEN_EXPIRY=1h

# Şifre Sıfırlama URL (frontend URL'i)
RESET_PASSWORD_URL=http://localhost:3000
```

### 4. Seed Data Güncelleme

Mevcut seed data çalışacak, ancak yeni alanlar için default değerler kullanılacak.

## ⚠️ Breaking Changes

1. **Token Yapısı**: Artık `accessToken` ve `refreshToken` ayrı ayrı dönüyor
2. **Login Response**: Response formatı değişti:
   ```json
   {
     "tokens": {
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```
3. **Middleware**: `authenticate` yerine `verifyToken` kullanılıyor (backward compatible)

## 🔄 Frontend Güncellemeleri

### API Service Güncellemesi

```javascript
// Eski
const response = await authAPI.login(credentials);
localStorage.setItem('token', response.data.token);

// Yeni
const response = await authAPI.login(credentials);
localStorage.setItem('accessToken', response.data.tokens.accessToken);
localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
```

### Token Refresh Mekanizması

```javascript
// API interceptor'da token refresh ekle
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Access token süresi dolmuş, refresh et
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken({ refreshToken });
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
          // Orijinal isteği tekrar dene
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh token da geçersiz, logout yap
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

## ✅ Test Checklist

- [ ] Migration başarıyla çalıştı
- [ ] Yeni kullanıcı kaydı çalışıyor
- [ ] Login access + refresh token dönüyor
- [ ] Token refresh çalışıyor
- [ ] Logout token'ı geçersizleştiriyor
- [ ] Şifre değiştirme çalışıyor
- [ ] Şifre sıfırlama flow'u çalışıyor
- [ ] Rate limiting çalışıyor
- [ ] Hesap kilitleme çalışıyor

## 📚 Daha Fazla Bilgi

- `POSTMAN_COLLECTION.md` - API endpoint'leri
- `TEST_SCENARIOS.md` - Test senaryoları
- `README.md` - Genel dokümantasyon
