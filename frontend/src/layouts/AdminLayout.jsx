import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Yükleniyor...</div>;

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/anasayfa" replace />;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
