// Admin Footer Page - Footer içeriğini düzenleme sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminFooterPage.css';

function AdminFooterPage() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState({
    description: '',
    email: '',
    phone: '',
    address: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    privacyPolicyContent: '',
    termsContent: '',
    mesafeliSatisSozlesmesi: '',
    kisiselVerilerIsleme: '',
    uyelikSozlesmesi: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (authLoading) return;

    if (!user || user?.role !== 'ADMIN') {
      navigate('/anasayfa');
      return;
    }

    loadFooter();
  }, [user, authLoading, navigate]);

  const loadFooter = async () => {
    try {
      setLoading(true);
      const response = await footerAPI.getFooter();
      if (response.success) {
        const footerData = response.data.footer || {};
        setFooter({
          description: footerData.description || '',
          email: footerData.email || '',
          phone: footerData.phone || '',
          address: footerData.address || '',
          twitterUrl: footerData.twitterUrl || '',
          facebookUrl: footerData.facebookUrl || '',
          instagramUrl: footerData.instagramUrl || '',
          privacyPolicyContent: footerData.privacyPolicyContent || '',
          termsContent: footerData.termsContent || '',
          mesafeliSatisSozlesmesi: footerData.mesafeliSatisSozlesmesi || '',
          kisiselVerilerIsleme: footerData.kisiselVerilerIsleme || '',
          uyelikSozlesmesi: footerData.uyelikSozlesmesi || '',
        });
      }
    } catch (error) {
      console.error('Footer yükleme hatası:', error);
      setMessage({ type: 'error', text: 'Footer bilgileri yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFooter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await footerAPI.updateFooter(footer);
      if (response.success) {
        setMessage({ type: 'success', text: 'Footer başarıyla güncellendi!' });
        // Footer'ı yeniden yükle
        await loadFooter();
      } else {
        const errorMessage = response.message || response.error || 'Footer güncellenirken bir hata oluştu.';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Footer güncelleme hatası:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Footer güncellenirken bir hata oluştu.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!user || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="admin-footer-page">

      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Geri Dön
          </button>
          <h1>📝 Footer Yönetimi</h1>
          <p>Footer içeriğini ve yasal sayfaları düzenleyin</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="footer-form">
          {/* Genel Bilgiler */}
          <div className="form-section">
            <h2>📋 Genel Bilgiler</h2>
            <div className="form-group">
              <label htmlFor="description">Platform Açıklaması</label>
              <textarea
                id="description"
                name="description"
                value={footer.description}
                onChange={handleChange}
                rows="3"
                placeholder="Platform hakkında kısa açıklama..."
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={footer.email}
                  onChange={handleChange}
                  placeholder="info@uzmangys.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={footer.phone}
                  onChange={handleChange}
                  placeholder="+90 (XXX) XXX XX XX"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Adres</label>
              <input
                type="text"
                id="address"
                name="address"
                value={footer.address}
                onChange={handleChange}
                placeholder="Türkiye"
                className="form-input"
              />
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="form-section">
            <h2>📱 Sosyal Medya</h2>
            <div className="form-group">
              <label htmlFor="twitterUrl">Twitter/X URL</label>
              <input
                type="url"
                id="twitterUrl"
                name="twitterUrl"
                value={footer.twitterUrl}
                onChange={handleChange}
                placeholder="https://x.com/uzmangys"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebookUrl">Facebook URL</label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                value={footer.facebookUrl}
                onChange={handleChange}
                placeholder="https://facebook.com/uzmangys"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagramUrl">Instagram URL</label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                value={footer.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/uzmangys"
                className="form-input"
              />
            </div>
          </div>

          {/* Gizlilik Politikası */}
          <div className="form-section">
            <h2>🔒 Gizlilik Politikası</h2>
            <div className="form-group">
              <label htmlFor="privacyPolicyContent">İçerik</label>
              <textarea
                id="privacyPolicyContent"
                name="privacyPolicyContent"
                value={footer.privacyPolicyContent}
                onChange={handleChange}
                rows="15"
                placeholder="Gizlilik politikası içeriğini buraya yazın..."
                className="form-input form-textarea-large"
              />
              <small className="form-hint">
                Bu içerik <code>/gizlilik-politikasi</code> sayfasında görüntülenecektir.
              </small>
            </div>
          </div>

          {/* Kullanım Koşulları */}
          <div className="form-section">
            <h2>📜 Kullanım Koşulları</h2>
            <div className="form-group">
              <label htmlFor="termsContent">İçerik</label>
              <textarea
                id="termsContent"
                name="termsContent"
                value={footer.termsContent}
                onChange={handleChange}
                rows="15"
                placeholder="Kullanım koşulları içeriğini buraya yazın..."
                className="form-input form-textarea-large"
              />
              <small className="form-hint">
                Bu içerik <code>/kullanim-kosullari</code> sayfasında görüntülenecektir.
              </small>
            </div>
          </div>

          {/* Mesafeli Satış Sözleşmesi */}
          <div className="form-section">
            <h2>🛒 Mesafeli Satış Sözleşmesi</h2>
            <div className="form-group">
              <label htmlFor="mesafeliSatisSozlesmesi">İçerik</label>
              <textarea
                id="mesafeliSatisSozlesmesi"
                name="mesafeliSatisSozlesmesi"
                value={footer.mesafeliSatisSozlesmesi}
                onChange={handleChange}
                rows="15"
                placeholder="Mesafeli satış sözleşmesi içeriğini buraya yazın..."
                className="form-input form-textarea-large"
              />
              <small className="form-hint">
                Bu içerik <code>/mesafeli-satis-sozlesmesi</code> sayfasında görüntülenecektir.
              </small>
            </div>
          </div>

          {/* Kişisel Verilerin Kullanılması ve İşlenmesi */}
          <div className="form-section">
            <h2>🔐 Kişisel Verilerin Kullanılması ve İşlenmesi</h2>
            <div className="form-group">
              <label htmlFor="kisiselVerilerIsleme">İçerik</label>
              <textarea
                id="kisiselVerilerIsleme"
                name="kisiselVerilerIsleme"
                value={footer.kisiselVerilerIsleme}
                onChange={handleChange}
                rows="15"
                placeholder="Kişisel verilerin kullanılması ve işlenmesi içeriğini buraya yazın..."
                className="form-input form-textarea-large"
              />
              <small className="form-hint">
                Bu içerik <code>/kisisel-veriler</code> sayfasında görüntülenecektir.
              </small>
            </div>
          </div>

          {/* Üyelik Sözleşmesi */}
          <div className="form-section">
            <h2>📋 Üyelik Sözleşmesi</h2>
            <div className="form-group">
              <label htmlFor="uyelikSozlesmesi">İçerik</label>
              <textarea
                id="uyelikSozlesmesi"
                name="uyelikSozlesmesi"
                value={footer.uyelikSozlesmesi}
                onChange={handleChange}
                rows="15"
                placeholder="Üyelik sözleşmesi içeriğini buraya yazın..."
                className="form-input form-textarea-large"
              />
              <small className="form-hint">
                Bu içerik <code>/uyelik-sozlesmesi</code> sayfasında görüntülenecektir.
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminFooterPage;
