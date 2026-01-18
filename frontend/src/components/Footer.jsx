// Footer Component - Tüm sayfalarda kullanılacak footer
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerAPI } from '../services/api';
import { FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    description: 'Kamu personeli sınavlarına hazırlanan adaylar için kapsamlı içerik ve soru bankası.',
    email: 'info@uzmangys.com',
    phone: '+90 (555) 555 55 55',
    address: 'Ankara, Türkiye',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

  // İstatistikleri sadece anasayfada göster (/ veya /anasayfa)
  const showStats = location.pathname === '/' || location.pathname === '/anasayfa';

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    try {
      const response = await footerAPI.getFooter();
      if (response.success && response.data.footer) {
        setFooterData({
          description: response.data.footer.description || footerData.description,
          email: response.data.footer.email || footerData.email,
          phone: response.data.footer.phone || footerData.phone,
          address: response.data.footer.address || footerData.address,
          twitterUrl: response.data.footer.twitterUrl || '',
          facebookUrl: response.data.footer.facebookUrl || '',
          instagramUrl: response.data.footer.instagramUrl || '',
        });
      }
    } catch (error) {
      console.error('Footer yükleme hatası:', error);
    }
  };

  return (
    <footer className="site-footer">
      {/* Üst İstatistik Bölümü - Sadece Anasayfada */}
      {showStats && (
        <div className="footer-stats-section">
          <div className="footer-container">
            <div className="stats-content">
              {/* Sol Taraf - CTA */}
              <div className="stats-cta">
                <h2>Türkiye'nin 81 ilinden binlerce memur adayı ile birlikte çalışın.</h2>
                <div className="stats-buttons">
                  <button
                    className="btn-stats btn-orange"
                    onClick={() => navigate(user ? '/paketler' : '/kayit')}
                  >
                    {user ? 'Paketleri İncele' : 'Aramıza Katıl'}
                  </button>
                  <button
                    className="btn-stats btn-dark-outline"
                    onClick={() => navigate('/deneme-sinavlari')}
                  >
                    Sınavları İncele
                  </button>
                </div>
              </div>

              {/* Sağ Taraf - Rakamlar */}
              <div className="stats-grid">
                <div className="stat-item">
                  <h3>100+</h3>
                  <p>Deneme Sınavı</p>
                </div>
                <div className="stat-item">
                  <h3>25K+</h3>
                  <p>Kayıtlı Aday</p>
                </div>
                <div className="stat-item">
                  <h3>%95</h3>
                  <p>Başarı Oranı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ana Footer İçeriği */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-columns">
            {/* 1. Kolon: Marka ve Açıklama */}
            <div className="footer-col brand-col">
              <div className="footer-logo">
                <div className="footer-logo-icon">📚</div>
                <div className="footer-logo-text">
                  <h3>UzmanGYS</h3>
                  <p>Sınav Hazırlık Platformu</p>
                </div>
              </div>
              <p className="footer-desc-text">
                {footerData.description}
              </p>

              {/* Sosyal Medya */}
              <div className="footer-social-links">
                {footerData.facebookUrl && (
                  <a href={footerData.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                    <FaFacebook />
                  </a>
                )}
                {footerData.twitterUrl && (
                  <a href={footerData.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                    <FaXTwitter />
                  </a>
                )}
                {footerData.instagramUrl && (
                  <a href={footerData.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                    <FaInstagram />
                  </a>
                )}
              </div>
            </div>

            {/* 2. Kolon: Sınav Kategorileri */}
            <div className="footer-col">
              <h4>Kategoriler</h4>
              <ul className="footer-links-list">
                <li><button onClick={() => navigate('/paketler')}>Adalet Bakanlığı GYS</button></li>
                <li><button onClick={() => navigate('/paketler')}>İcra Müdürlüğü</button></li>
                <li><button onClick={() => navigate('/paketler')}>Görevde Yükselme</button></li>
                <li><button onClick={() => navigate('/paketler')}>Unvan Değişikliği</button></li>
              </ul>
            </div>

            {/* 3. Kolon: Hızlı Erişim */}
            <div className="footer-col">
              <h4>Hızlı Erişim</h4>
              <ul className="footer-links-list">
                <li><button onClick={() => navigate('/anasayfa')}>Ana Sayfa</button></li>
                <li><button onClick={() => navigate('/hakkimizda')}>Hakkımızda</button></li>
                <li><button onClick={() => navigate('/iletisim')}>İletişim</button></li>
                <li><button onClick={() => navigate('/kariyer')}>Kariyer</button></li>
              </ul>
            </div>

            {/* 4. Kolon: Destek & Yasal */}
            <div className="footer-col">
              <h4>Destek</h4>
              <ul className="footer-links-list">
                <li><button onClick={() => navigate('/sss')}>Sıkça Sorulan Sorular</button></li>
                <li><button onClick={() => navigate('/gizlilik-politikasi')}>Gizlilik Politikası</button></li>
                <li><button onClick={() => navigate('/kullanim-kosullari')}>Kullanım Koşulları</button></li>
                <li><button onClick={() => navigate('/mesafeli-satis-sozlesmesi')}>Mesafeli Satış Sözleşmesi</button></li>
              </ul>
            </div>

            {/* 5. Kolon: Uygulamayı İndir */}
            <div className="footer-col app-col">
              <h4>Uygulamamızı İndirin</h4>
              <div className="app-buttons">
                <button className="btn-app-store">
                  <FaApple className="app-icon" />
                  <div className="app-text">
                    <span className="small-text">Download on the</span>
                    <span className="big-text">App Store</span>
                  </div>
                </button>
                <button className="btn-google-play">
                  <FaGooglePlay className="app-icon" />
                  <div className="app-text">
                    <span className="small-text">Get it on</span>
                    <span className="big-text">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p>© {currentYear} UzmanGYS. Tüm hakları saklıdır. Designed by UzmanGYS Team.</p>
            <div className="footer-lang-selector">
              <select className="lang-select" defaultValue="tr">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
