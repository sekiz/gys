// Admin User Page - Admin Kullanıcı Yönetimi Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminUserPage.css';

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    password: '',
    isActive: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Admin kontrolü
    if (user?.role !== 'ADMIN') {
      navigate('/anasayfa');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error);
      setMessage({ type: 'error', text: error.message || 'Kullanıcılar yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'STUDENT',
      password: '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    });
    setShowEditModal(true);
    setMessage({ type: '', text: '' });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'STUDENT',
      password: '',
      isActive: true,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setProcessing('edit');
      setMessage({ type: '', text: '' });

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      // Şifre değiştiriliyorsa ekle
      if (formData.password.trim()) {
        updateData.password = formData.password.trim();
      }

      const response = await userAPI.updateUser(editingUser.id, updateData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla güncellendi.' });
        closeEditModal();
        await loadUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Kullanıcı güncellenirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const openDeleteModal = (userItem) => {
    setUserToDelete(userItem);
    setDeleteConfirmEmail('');
    setDeleteConfirmChecked(false);
    setShowDeleteModal(true);
    setMessage({ type: '', text: '' });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteConfirmEmail('');
    setDeleteConfirmChecked(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setProcessing(userToDelete.id);
      const response = await userAPI.deleteUser(userToDelete.id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla silindi.' });
        closeDeleteModal();
        await loadUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Kullanıcı silinirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      setProcessing(`toggle-${userId}`);
      const response = await userAPI.toggleUserActive(userId);
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        await loadUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Kullanıcı durumu değiştirilirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Yönetici';
      case 'STUDENT':
        return 'Öğrenci';
      case 'INSTRUCTOR':
        return 'Eğitmen';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="admin-user-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-page">

      <div className="container">
        <div className="admin-header">
          <h1>👥 Kullanıcı Yönetimi</h1>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Son Giriş</th>
                <th>Kayıt Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    Henüz kullanıcı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                users.map((userItem) => (
                  <tr key={userItem.id} className={!userItem.isActive ? 'inactive' : ''}>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>
                      <span className={`role-badge role-${userItem.role.toLowerCase()}`}>
                        {getRoleLabel(userItem.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${userItem.isActive ? 'active' : 'inactive'}`}>
                        {userItem.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      {userItem.lastLogin
                        ? new Date(userItem.lastLogin).toLocaleDateString('tr-TR')
                        : 'Henüz giriş yapmadı'}
                    </td>
                    <td>{new Date(userItem.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => openEditModal(userItem)}
                          disabled={processing}
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          className="btn btn-toggle"
                          onClick={() => handleToggleActive(userItem.id)}
                          disabled={processing || processing === `toggle-${userItem.id}`}
                        >
                          {userItem.isActive ? '🔒 Pasif Yap' : '✅ Aktif Yap'}
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => openDeleteModal(userItem)}
                          disabled={processing || userItem.id === user?.id}
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>⚠️ Kullanıcı Silme Onayı</h2>
                <button className="modal-close" onClick={closeDeleteModal}>×</button>
              </div>
              <div className="delete-warning">
                <p className="warning-text">
                  <strong>{userToDelete.name}</strong> ({userToDelete.email}) adlı kullanıcıyı silmek istediğinize emin misiniz?
                </p>
                <div className="warning-details">
                  <p>⚠️ Bu işlem <strong>geri alınamaz!</strong></p>
                  <ul>
                    <li>Kullanıcının tüm verileri kalıcı olarak silinecektir</li>
                    <li>Kullanıcının sınav sonuçları silinecektir</li>
                    <li>Kullanıcının paket bilgileri silinecektir</li>
                  </ul>
                </div>
                <div className="confirm-section">
                  <p className="confirm-text">
                    Silmek için kullanıcının <strong>e-posta adresini</strong> yazın:
                  </p>
                  <input
                    type="email"
                    className="form-input confirm-input"
                    placeholder={userToDelete.email}
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="confirm-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={deleteConfirmChecked}
                        onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                      />
                      <span>Bu işlemin geri alınamaz olduğunu ve tüm verilerin kalıcı olarak silineceğini anlıyorum</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleDelete}
                  disabled={
                    processing === userToDelete.id ||
                    deleteConfirmEmail !== userToDelete.email ||
                    !deleteConfirmChecked
                  }
                >
                  {processing === userToDelete.id ? 'Siliniyor...' : '🗑️ Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Kullanıcı Düzenle</h2>
                <button className="modal-close" onClick={closeEditModal}>×</button>
              </div>
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="STUDENT">Öğrenci</option>
                    <option value="ADMIN">Yönetici</option>
                    <option value="INSTRUCTOR">Eğitmen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Şifre (Değiştirmek için doldurun)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={8}
                    placeholder="Boş bırakılırsa değişmez"
                  />
                  <small className="form-help">En az 8 karakter</small>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={processing === 'edit'}>
                    {processing === 'edit' ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserPage;
