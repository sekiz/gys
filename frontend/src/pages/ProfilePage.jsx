// Profile Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProfilePage.css';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    city: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // user değiştiğinde de yükle

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Önce AuthContext'ten user bilgisini kullan
      if (user) {
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          city: user.city || '',
        });
        setLoading(false);
        return;
      }
      
      // Eğer user yoksa API'den çek
      const response = await authAPI.getProfile();
      if (response.success) {
        const userData = response.data.user;
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          city: userData.city || '',
        });
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      const errorMessage = error.message || 'Profil bilgileri yüklenirken bir hata oluştu.';
      
      // Backend bağlantı hatası kontrolü
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Bağlantı hatası')) {
        setMessage({ 
          type: 'error', 
          text: 'Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun (http://localhost:5000)' 
        });
      } else {
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      // Client-side validation
      if (!profileForm.name.trim() && !profileForm.email.trim()) {
        setMessage({ type: 'error', text: 'En az bir alan (isim veya e-posta) doldurulmalıdır.' });
        setProcessing(false);
        return;
      }

      if (profileForm.name.trim() && profileForm.name.trim().length < 2) {
        setMessage({ type: 'error', text: 'İsim en az 2 karakter olmalıdır.' });
        setProcessing(false);
        return;
      }

      if (profileForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
        setMessage({ type: 'error', text: 'Geçerli bir e-posta adresi giriniz.' });
        setProcessing(false);
        return;
      }

      const response = await authAPI.updateProfile({
        name: profileForm.name.trim() || undefined,
        email: profileForm.email.trim() || undefined,
        city: profileForm.city.trim() || undefined,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
        // Auth context'i güncelle
        if (updateUser) {
          updateUser(response.data.user);
        }
        // Form'u güncelle
        setProfileForm({
          name: response.data.user.name,
          email: response.data.user.email,
          city: response.data.user.city || '',
        });
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      // Backend'den gelen hata mesajını göster
      const errorMessage = error.message || 'Profil güncellenirken bir hata oluştu.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setProcessing(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!passwordForm.currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Mevcut şifre gereklidir.' });
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setMessage({ type: 'error', text: 'Yeni şifre gereklidir.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır.' });
      return;
    }

    // Şifre format kontrolü (en az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setMessage({ 
        type: 'error', 
        text: 'Yeni şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter (@$!%*?&) içermelidir.' 
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      const response = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi.' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      const errorMessage = error.message || 'Şifre değiştirilirken bir hata oluştu.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // Eğer user yoksa (henüz yüklenmediyse)
  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="container">
          <div className="loading">Kullanıcı bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="profile-header">
          <h1>👤 Profil Ayarları</h1>
          <p>Hesap bilgilerinizi görüntüleyin ve güncelleyin</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          {/* Profil Bilgileri */}
          <div className="profile-section">
            <div className="section-header">
              <h2>📝 Kişisel Bilgiler</h2>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>E-posta Adresi *</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Şehir</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  placeholder="Örn: İstanbul, Ankara, İzmir..."
                  maxLength={100}
                />
                <small className="form-help">Şehir bilgisi sıralama sayfasında görüntülenecektir (opsiyonel)</small>
              </div>
              <div className="form-group">
                <label>Rol</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.role === 'ADMIN' ? 'Yönetici' : user?.role === 'STUDENT' ? 'Öğrenci' : user?.role}
                  disabled
                />
              </div>
              {user?.lastLogin && (
                <div className="form-group">
                  <label>Son Giriş</label>
                  <input
                    type="text"
                    className="form-input"
                    value={new Date(user.lastLogin).toLocaleString('tr-TR')}
                    disabled
                  />
                </div>
              )}
              {user?.createdAt && (
                <div className="form-group">
                  <label>Kayıt Tarihi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    disabled
                  />
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={processing}>
                {processing ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
              </button>
            </form>
          </div>

          {/* Şifre Değiştirme */}
          <div className="profile-section">
            <div className="section-header">
              <h2>🔒 Şifre Değiştir</h2>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Mevcut Şifre *</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Yeni Şifre *</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
                <small className="form-help">
                  En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir.
                </small>
              </div>
              <div className="form-group">
                <label>Yeni Şifre (Tekrar) *</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={processing}>
                {processing ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;
