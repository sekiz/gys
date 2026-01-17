// Auth Context - Kullanıcı kimlik doğrulama yönetimi
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri yüklenemedi:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Kayıt ol
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        // Backend'den tokens objesi içinde accessToken geliyor
        const accessToken = response.data.tokens?.accessToken || response.data.accessToken;
        if (accessToken) {
          setToken(accessToken);
          // Yeni oturum başladığında sessionStorage'daki istatistikleri temizle
          sessionStorage.removeItem('mixedQuizStats');
          setUser(response.data.user);
          setIsAuthenticated(true);
          return { success: true };
        }
        return { success: false, error: 'Token alınamadı' };
      }
      return { success: false, error: response.message || 'Kayıt başarısız' };
    } catch (error) {
      return { success: false, error: error.message || 'Bir hata oluştu' };
    }
  };

  // Giriş yap
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        // Backend'den tokens objesi içinde accessToken geliyor
        const accessToken = response.data.tokens?.accessToken || response.data.accessToken;
        if (accessToken) {
          setToken(accessToken);
          // Yeni oturum başladığında sessionStorage'daki istatistikleri temizle
          sessionStorage.removeItem('mixedQuizStats');
          setUser(response.data.user);
          setIsAuthenticated(true);
          return { success: true, user: response.data.user };
        }
        return { success: false, error: 'Token alınamadı' };
      }
      return { success: false, error: response.message || 'Giriş başarısız' };
    } catch (error) {
      return { success: false, error: error.message || 'Bir hata oluştu' };
    }
  };

  // Şifremi unuttum
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, error: response.error || response.message || 'İşlem başarısız' };
    } catch (error) {
      return { success: false, error: error.message || 'Bir hata oluştu' };
    }
  };

  // Çıkış yap
  const logout = () => {
    removeToken();
    // SessionStorage'daki oturum istatistiklerini temizle
    sessionStorage.removeItem('mixedQuizStats');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Kullanıcı bilgilerini güncelle
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    forgotPassword,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
