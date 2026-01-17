// Footer Component - Tüm sayfalarda kullanılacak footer
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerAPI } from '../services/api';
import { FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    description: 'Kamu personeli sınavlarına hazırlanan adaylar için kapsamlı içerik ve soru bankası.',
    email: 'info@uzmangys.com',
    phone: '+90 (XXX) XXX XX XX',
    address: 'Türkiye',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

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
      // Hata durumunda varsayılan değerler kullanılacak
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Sol Taraf - Logo ve Açıklama */}
          <div className="footer-section footer-about">
            <div className="footer-logo">
              <div className="footer-logo-icon">📚</div>
              <div className="footer-logo-text">
                <h3>UzmanGYS</h3>
                <p>Kamu Sınavları Hazırlık Platformu</p>
              </div>
            </div>
            <p className="footer-description">
              {footerData.description}
            </p>

            {/* Sosyal Medya */}
            {(footerData.twitterUrl || footerData.facebookUrl || footerData.instagramUrl) && (
              <div className="footer-social">
                <div className="social-links">
                  {footerData.twitterUrl && (
                    <a
                      href={footerData.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title="Twitter/X"
                    >
                      <FaXTwitter className="social-icon" />
                    </a>
                  )}
                  {footerData.facebookUrl && (
                    <a
                      href={footerData.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title="Facebook"
                    >
                      <FaFacebook className="social-icon" />
                    </a>
                  )}
                  {footerData.instagramUrl && (
                    <a
                      href={footerData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title="Instagram"
                    >
                      <FaInstagram className="social-icon" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Orta - Hızlı Linkler */}
          <div className="footer-section footer-links">
            <h4>Hızlı Erişim</h4>
            <ul>
              {user ? (
                <>
                  <li>
                    <button onClick={() => navigate('/anasayfa')}>Ana Sayfa</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/paketler')}>Paketlerim</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/istatistikler')}>İstatistiklerim</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/quiz/karisik')}>Karışık Soru Çöz</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button onClick={() => navigate('/')}>Ana Sayfa</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/giris')}>Giriş Yap</button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/kayit')}>Kayıt Ol</button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Sağ Taraf - İletişim ve Bilgiler */}
          <div className="footer-section footer-contact">
            <h4>İletişim</h4>
            <ul>
              <li>
                <span className="footer-icon">📧</span>
                <span>{footerData.email}</span>
              </li>
              <li>
                <span className="footer-icon">📞</span>
                <span>{footerData.phone}</span>
              </li>
              <li>
                <span className="footer-icon">📍</span>
                <span>{footerData.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım - Telif Hakkı */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} UzmanGYS. Tüm hakları saklıdır.
            </p>
            <div className="footer-legal">
              <button onClick={() => navigate('/gizlilik-politikasi')}>Gizlilik Politikası</button>
              <span className="footer-separator">|</span>
              <button onClick={() => navigate('/cerez-politikasi')}>Çerez Politikası</button>
              <span className="footer-separator">|</span>
              <button onClick={() => navigate('/kullanim-kosullari')}>Kullanım Koşulları</button>
              <span className="footer-separator">|</span>
              <button onClick={() => navigate('/mesafeli-satis-sozlesmesi')}>Mesafeli Satış Sözleşmesi</button>
              <span className="footer-separator">|</span>
              <button onClick={() => navigate('/kisisel-veriler')}>Kişisel Verilerin Kullanılması</button>
              <span className="footer-separator">|</span>
              <button onClick={() => navigate('/uyelik-sozlesmesi')}>Üyelik Sözleşmesi</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
