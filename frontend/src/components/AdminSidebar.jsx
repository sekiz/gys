import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome,
    FaChalkboardTeacher,
    FaBoxOpen,
    FaUsers,
    FaFileAlt,
    FaImages,
    FaLink,
    FaSignOutAlt,
    FaClipboardList,
    FaBug,
    FaChartLine
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/giris');
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">🛡️</div>
                <h2>Admin Panel</h2>
            </div>

            <div className="user-info">
                <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/anasayfa" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaHome /> Siteye Dön
                        </NavLink>
                    </li>
                    <li className="nav-header">YÖNETİM</li>
                    <li>
                        <NavLink to="/yonetim/dashboard" className={({ isActive }) => (isActive ? 'active' : '')} end>
                            <FaChartLine /> Kontrol Paneli
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/sinavlar" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaChalkboardTeacher /> Sınavlar
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/deneme-sinavlari" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaClipboardList /> Deneme Sınavları
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/paketler" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaBoxOpen /> Paketler
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/kullanicilar" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaUsers /> Kullanıcılar
                        </NavLink>
                    </li>

                    <li className="nav-header">İÇERİK & AYARLAR</li>
                    <li>
                        <NavLink to="/yonetim/hatali-sorular" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaBug /> Hatalı Sorular
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/slider" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaImages /> Slider Yönetimi
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/yonetim/footer" className={({ isActive }) => (isActive ? 'active' : '')}>
                            <FaLink /> Footer Linkleri
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
