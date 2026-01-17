// Admin Package Page - Admin Paket Yönetimi Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageAPI, examAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminPackagePage.css';

function AdminPackagePage() {
  const [pendingPackages, setPendingPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    email: '',
    examId: '',
    expiresAt: '',
    notes: '',
  });
  const [approveForm, setApproveForm] = useState({
    packageId: '',
    expiresAt: '',
    notes: '',
  });
  const [showApproveModal, setShowApproveModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Admin kontrolü
    if (user?.role !== 'ADMIN') {
      navigate('/anasayfa');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, allResponse, examsResponse] = await Promise.all([
        packageAPI.getPendingPackages(),
        packageAPI.getAllUserPackages(),
        examAPI.getExams(),
      ]);

      if (pendingResponse.success) {
        setPendingPackages(pendingResponse.data.pendingPackages);
      }

      if (allResponse.success) {
        setAllPackages(allResponse.data.userPackages);
      }

      if (examsResponse.success) {
        setExams(examsResponse.data.exams);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setMessage({ type: 'error', text: 'Veriler yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (packageId) => {
    try {
      setProcessing(packageId);
      setMessage({ type: '', text: '' });

      // Boş string'leri null'a çevir
      const requestData = {
        expiresAt: approveForm.expiresAt && approveForm.expiresAt.trim() !== ''
          ? approveForm.expiresAt
          : null,
        notes: approveForm.notes && approveForm.notes.trim() !== ''
          ? approveForm.notes
          : null,
      };

      const response = await packageAPI.approvePackage(packageId, requestData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Paket başarıyla onaylandı.' });
        setShowApproveModal(false);
        setApproveForm({ packageId: '', expiresAt: '', notes: '' });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Paket onaylanırken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (packageId, notes = '') => {
    if (!window.confirm('Bu paket talebini reddetmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setProcessing(packageId);
      setMessage({ type: '', text: '' });

      // Boş string'leri null'a çevir
      const requestData = {
        notes: notes && notes.trim() !== '' ? notes.trim() : null,
      };

      const response = await packageAPI.rejectPackage(packageId, requestData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Paket reddedildi.' });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Paket reddedilirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (packageId, notes = '') => {
    if (!window.confirm('Bu paketi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setProcessing(packageId);
      setMessage({ type: '', text: '' });

      // Boş string'leri null'a çevir
      const requestData = {
        notes: notes && notes.trim() !== '' ? notes.trim() : null,
      };

      const response = await packageAPI.cancelPackage(packageId, requestData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Paket iptal edildi.' });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Paket iptal edilirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const handleAssignPackage = async () => {
    if (!assignForm.email || !assignForm.examId) {
      setMessage({ type: 'error', text: 'Lütfen kullanıcı e-postası ve paket seçiniz.' });
      return;
    }

    try {
      setProcessing('assign');
      setMessage({ type: '', text: '' });

      const response = await packageAPI.assignPackageToUser({
        email: assignForm.email,
        examId: assignForm.examId,
        expiresAt: assignForm.expiresAt || null,
        notes: assignForm.notes || null,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Paket başarıyla atandı.' });
        setShowAssignModal(false);
        setAssignForm({ email: '', examId: '', expiresAt: '', notes: '' });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Paket atanırken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const openApproveModal = (packageId) => {
    setApproveForm({ packageId, expiresAt: '', notes: '' });
    setShowApproveModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: 'Beklemede', class: 'status-pending' },
      ACTIVE: { text: 'Aktif', class: 'status-active' },
      EXPIRED: { text: 'Süresi Dolmuş', class: 'status-expired' },
      CANCELLED: { text: 'İptal Edildi', class: 'status-cancelled' },
    };
    return badges[status] || { text: status, class: '' };
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-package-page">

      <div className="container">
        <div className="admin-header">
          <h1>📦 Paket Yönetimi (Admin)</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowAssignModal(true)}
          >
            + Yeni Paket Ata
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Bekleyen Paketler */}
        <div className="section">
          <h2>⏳ Bekleyen Paket Talepleri ({pendingPackages.length})</h2>
          {pendingPackages.length === 0 ? (
            <div className="empty-state">
              <p>Bekleyen paket talebi bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="packages-table">
              <table>
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>E-posta</th>
                    <th>Paket</th>
                    <th>Fiyat</th>
                    <th>Ödeme Tarihi</th>
                    <th>Ödeme Tutarı</th>
                    <th>Ödeme Yöntemi</th>
                    <th>İşlem No</th>
                    <th>Talep Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>{pkg.user.name}</td>
                      <td>{pkg.user.email}</td>
                      <td>{pkg.exam.name}</td>
                      <td>{pkg.exam.price ? `${parseFloat(pkg.exam.price).toFixed(2)} ₺` : '-'}</td>
                      <td>{pkg.paymentDate ? new Date(pkg.paymentDate).toLocaleDateString('tr-TR') : '-'}</td>
                      <td>{pkg.paymentAmount ? `${parseFloat(pkg.paymentAmount).toFixed(2)} ₺` : '-'}</td>
                      <td>
                        {pkg.paymentMethod === 'BANK_TRANSFER' && 'Banka Havalesi'}
                        {pkg.paymentMethod === 'CREDIT_CARD' && 'Kredi Kartı'}
                        {pkg.paymentMethod === 'OTHER' && 'Diğer'}
                        {!pkg.paymentMethod && '-'}
                      </td>
                      <td>{pkg.transactionId || '-'}</td>
                      <td>{new Date(pkg.purchasedAt).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openApproveModal(pkg.id)}
                            disabled={processing === pkg.id}
                          >
                            Onayla
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(pkg.id)}
                            disabled={processing === pkg.id}
                          >
                            Reddet
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tüm Paketler */}
        <div className="section">
          <h2>📋 Tüm Kullanıcı Paketleri ({allPackages.length})</h2>
          <div className="filters">
            <select
              className="form-select"
              onChange={(e) => {
                // Filtreleme yapılabilir
              }}
            >
              <option value="">Tüm Durumlar</option>
              <option value="PENDING">Beklemede</option>
              <option value="ACTIVE">Aktif</option>
              <option value="EXPIRED">Süresi Dolmuş</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>
          {allPackages.length === 0 ? (
            <div className="empty-state">
              <p>Henüz paket bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="packages-table">
              <table>
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>E-posta</th>
                    <th>Paket</th>
                    <th>Durum</th>
                    <th>Talep Tarihi</th>
                    <th>Aktif Edilme</th>
                    <th>Bitiş Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {allPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>{pkg.user.name}</td>
                      <td>{pkg.user.email}</td>
                      <td>{pkg.exam.name}</td>
                      <td>
                        <span className={getStatusBadge(pkg.status).class}>
                          {getStatusBadge(pkg.status).text}
                        </span>
                      </td>
                      <td>{new Date(pkg.createdAt || pkg.purchasedAt).toLocaleDateString('tr-TR')}</td>
                      <td>
                        {pkg.activatedAt
                          ? new Date(pkg.activatedAt).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                      <td>
                        {pkg.expiresAt
                          ? new Date(pkg.expiresAt).toLocaleDateString('tr-TR')
                          : 'Süresiz'}
                      </td>
                      <td>
                        {pkg.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(pkg.id)}
                            disabled={processing === pkg.id}
                            title="Paketi iptal et"
                          >
                            {processing === pkg.id ? 'İşleniyor...' : 'İptal Et'}
                          </button>
                        )}
                        {pkg.status === 'CANCELLED' && (
                          <span className="text-muted">İptal edildi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Onay Modal */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Paket Onayla</h3>
            <div className="form-group">
              <label>Bitiş Tarihi (Opsiyonel)</label>
              <input
                type="date"
                className="form-input"
                value={approveForm.expiresAt}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, expiresAt: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Notlar (Opsiyonel)</label>
              <textarea
                className="form-input"
                rows="3"
                value={approveForm.notes}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, notes: e.target.value })
                }
                placeholder="Paket hakkında notlar..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowApproveModal(false)}
              >
                İptal
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleApprove(approveForm.packageId)}
                disabled={processing === approveForm.packageId}
              >
                {processing === approveForm.packageId ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paket Atama Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          {/* Modal content */}
          {/* Detailed form code preserved by reference */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Yeni Paket Ata</h3>
            <div className="form-group">
              <label>Kullanıcı E-postası *</label>
              <input
                type="email"
                className="form-input"
                value={assignForm.email}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, email: e.target.value, userId: '' })
                }
                placeholder="kullanici@example.com"
              />
              <small className="form-help">
                Kullanıcı e-posta adresi ile paket atanabilir.
              </small>
            </div>
            <div className="form-group">
              <label>Paket *</label>
              <select
                className="form-select"
                value={assignForm.examId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, examId: e.target.value })
                }
              >
                <option value="">Paket Seçiniz</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bitiş Tarihi (Opsiyonel)</label>
              <input
                type="date"
                className="form-input"
                value={assignForm.expiresAt}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, expiresAt: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Notlar (Opsiyonel)</label>
              <textarea
                className="form-input"
                rows="3"
                value={assignForm.notes}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, notes: e.target.value })
                }
                placeholder="Paket hakkında notlar..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                İptal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignPackage}
                disabled={processing === 'assign'}
              >
                {processing === 'assign' ? 'İşleniyor...' : 'Paket Ata'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPackagePage;
