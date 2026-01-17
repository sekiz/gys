// JWT Token Utility Fonksiyonları
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = require('../config/auth');

/**
 * Access token oluştur (kısa ömürlü - 15 dakika)
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access',
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'uzmangys-api',
      audience: 'uzmangys-client',
    }
  );
}

/**
 * Refresh token oluştur (uzun ömürlü - 7 gün)
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'uzmangys-api',
      audience: 'uzmangys-client',
    }
  );
}

/**
 * Access token doğrula
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'uzmangys-api',
      audience: 'uzmangys-client',
    });
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token doğrula
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'uzmangys-api',
      audience: 'uzmangys-client',
    });
  } catch (error) {
    return null;
  }
}

/**
 * Token'dan payload çıkar (decode)
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Şifre sıfırlama token'ı oluştur (güvenli random string)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Token'ın tipini kontrol et
 */
function getTokenType(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded?.type || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  generateResetToken,
  getTokenType,
};
