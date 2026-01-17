// Header Component - Tüm sayfalarda kullanılacak header
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaHeart, FaShoppingCart, FaSearch, FaChevronDown } from 'react-icons/fa';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Scroll effect for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="site-header-wrapper">
      {/* 1. Top Bar (Dark) */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-inner">
            <div className="top-links">
              <span className="top-link" onClick={() => navigate('/')}>Anasayfa</span>
              <span className="top-link" onClick={() => navigate('/paketler')}>Paketler</span>
              <span className="top-link" onClick={() => navigate('/hakkimizda')}>Hakkımızda</span>
              <span className="top-link" onClick={() => navigate('/iletisim')}>İletişim</span>
              <span className="top-link">Eğitmen Başvurusu</span>
            </div>
            <div className="top-settings">
              <div className="setting-item">
                <span>TL</span> <FaChevronDown size={10} />
              </div>
              <div className="setting-item">
                <span>Türkçe</span> <FaChevronDown size={10} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Sticky) */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <div className="header-logo" onClick={() => navigate('/')}>
              <div className="header-logo-icon">📚</div>
              <div className="header-logo-text">
                <h1>UzmanGYS</h1>
              </div>
            </div>

            {/* Search Bar (Visible on desktop) */}
            <div className="header-search">
              <div className="search-wrapper">
                <select className="search-select">
                  <option>Kategori</option>
                  <option>Sınavlar</option>
                  <option>Paketler</option>
                </select>
                <div className="search-input-group">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Hangi sınava hazırlanıyorsunuz?"
                  />
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Icons */}
              <div className="action-icons">
                <button className="icon-btn">
                  <FaBell />
                  <span className="notification-badge"></span>
                </button>
                <button className="icon-btn">
                  <FaHeart />
                </button>
                <button className="icon-btn">
                  <FaShoppingCart />
                  <span className="notification-badge"></span>
                </button>
              </div>

              {/* Auth Buttons / User Menu */}
              {user ? (
                <div className="user-menu-container">
                  <div
                    className="user-profile-menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="avatar-circle">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-text-info">
                      <span className="user-name-display">{user.name}</span>
                      <span className="user-role-display">{user.role}</span>
                    </div>
                    <FaChevronDown size={12} className="ml-2" />
                  </div>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <div className="dropdown-divider"></div>

                      <button onClick={() => navigate('/profil')}>👤 Profil</button>
                      <button onClick={() => navigate('/paketler')}>📦 Paketlerim</button>
                      <button onClick={() => navigate('/istatistikler')}>📊 İstatistikler</button>

                      {user.role === 'ADMIN' && (
                        <>
                          <div className="dropdown-divider"></div>
                          <div className="dropdown-label">YÖNETİM</div>
                          <button onClick={() => navigate('/yonetim/slider')}>🖼️ Slider Yönetimi</button>
                          <button onClick={() => navigate('/yonetim/sinavlar')}>📋 Sınavlar</button>
                          <button onClick={() => navigate('/yonetim/paketler')}>📦 Paketler</button>
                          <button onClick={() => navigate('/yonetim/kullanicilar')}>👥 Kullanıcılar</button>
                          <button onClick={() => navigate('/yonetim/hatali-sorular')}>⚠️ Hatalı Sorular</button>
                          <button onClick={() => navigate('/yonetim/footer')}>📝 Footer</button>
                        </>
                      )}

                      <div className="dropdown-divider"></div>
                      <button onClick={logout} className="text-red">🚪 Çıkış Yap</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <button className="btn-create-account" onClick={() => navigate('/kayit')}>
                    Kayıt Ol
                  </button>
                  <button className="btn-sign-in" onClick={() => navigate('/giris')}>
                    Giriş Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
