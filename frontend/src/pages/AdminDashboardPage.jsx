import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FaUsers, FaGraduationCap, FaBoxOpen, FaMoneyBillWave, FaClock, FaUserPlus } from 'react-icons/fa';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Dashboard yükleme hatası:', err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return null;

    const { counts, recentUsers, recentSales, chartData } = stats;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const packageStatusData = [
        { name: 'Aktif', value: counts.activePackages },
        { name: 'Bekleyen', value: counts.pendingPackages },
    ];

    return (
        <div className="admin-dashboard-page">
            <div className="dashboard-header">
                <h1>📊 Kontrol Paneli</h1>
                <p>Platform genel durum özeti ve istatistikler</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <h3>Toplam Kullanıcı</h3>
                        <div className="stat-value">{counts.totalUsers}</div>
                        <div className="stat-subtext">+{counts.newUsers} bu ay</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-info">
                        <h3>Toplam Gelir</h3>
                        <div className="stat-value">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(counts.totalRevenue || 0)}
                        </div>
                        <div className="stat-subtext">Onaylanmış satışlar</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon yellow">
                        <FaClock />
                    </div>
                    <div className="stat-info">
                        <h3>Bekleyen İşlemler</h3>
                        <div className="stat-value">{counts.pendingPackages}</div>
                        <div className="stat-subtext">Paket onayı bekliyor</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <FaGraduationCap />
                    </div>
                    <div className="stat-info">
                        <h3>İçerik Durumu</h3>
                        <div className="stat-value">{counts.totalExams}</div>
                        <div className="stat-subtext">{counts.totalQuestions} Soru</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* User Growth Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📈 Kullanıcı Büyümesi (Son 6 Ay)</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Status Chart (Pie) */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📦 Paket Durumu</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={packageStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {packageStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#eab308'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="activity-section">
                {/* Recent Users */}
                <div className="activity-card">
                    <h3>👥 Son Kayıtolan Kullanıcılar</h3>
                    <div className="activity-list">
                        {recentUsers.length > 0 ? (
                            recentUsers.map(user => (
                                <div key={user.id} className="activity-item">
                                    <div className="activity-info">
                                        <span className="activity-title">{user.name}</span>
                                        <span className="activity-subtitle">{user.email}</span>
                                    </div>
                                    <div className="activity-meta">
                                        <div className="activity-date">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <span className={`status-badge badge-${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-text">Henüz kullanıcı yok.</p>
                        )}
                    </div>
                </div>

                {/* Recent Sales/Packages */}
                <div className="activity-card">
                    <h3>🛒 Son Paket Hareketleri</h3>
                    <div className="activity-list">
                        {recentSales.length > 0 ? (
                            recentSales.map(sale => (
                                <div key={sale.id} className="activity-item">
                                    <div className="activity-info">
                                        <span className="activity-title">{sale.exam.name}</span>
                                        <span className="activity-subtitle">{sale.user.name}</span>
                                    </div>
                                    <div className="activity-meta">
                                        <div className="activity-date">
                                            {new Date(sale.createdAt || sale.purchasedAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <span className={`status-badge badge-${sale.status === 'PENDING' ? 'pending' : 'active'}`}>
                                            {sale.status === 'PENDING' ? 'Beklemede' : 'Aktif'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-text">Henüz işlem yok.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
