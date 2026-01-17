// Authentication yapılandırması
module.exports = {
  // JWT Secret Keys
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-access-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  
  // Token süreleri
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m', // 15 dakika
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d', // 7 gün
  RESET_TOKEN_EXPIRY: process.env.RESET_TOKEN_EXPIRY || '1h', // 1 saat
  
  // Şifre kuralları
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 dakika (milisaniye)
  
  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
