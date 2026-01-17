// Admin Exam Page - Admin Sınav Yönetimi Sayfası
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminExamPage.css';

function AdminExamPage() {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    imageUrl: '',
    price: '',
    institution: '',
    category: '',
    rating: '',
    enrolledCount: '',
    isActive: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/anasayfa');
      return;
    }
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examAPI.getExams();
      if (response.success) {
        console.log('📊 Tüm sınavlar yüklendi:', response.data.exams.length);
        console.log('📊 Aktif sınavlar:', response.data.exams.filter(e => e.isActive).length);
        console.log('📊 Pasif sınavlar:', response.data.exams.filter(e => !e.isActive).length);
        setExams(response.data.exams);
        // Filtre useEffect tarafından otomatik uygulanacak
      }
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
      setMessage({ type: 'error', text: 'Sınavlar yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = useCallback((examsList, filterType) => {
    let filtered = examsList;
    if (filterType === 'active') {
      filtered = examsList.filter(exam => Boolean(exam.isActive) === true);
    } else if (filterType === 'inactive') {
      filtered = examsList.filter(exam => Boolean(exam.isActive) === false);
    }
    console.log(`🔍 Filtre uygulandı: ${filterType}, Toplam: ${examsList.length}, Sonuç: ${filtered.length} sınav`);
    console.log(`🔍 Pasif sınavlar:`, examsList.filter(e => !Boolean(e.isActive)).map(e => ({ id: e.id, name: e.name, isActive: e.isActive })));
    setFilteredExams(filtered);
  }, []);

  // exams veya filter değiştiğinde filtreyi uygula
  useEffect(() => {
    if (exams.length >= 0) { // Boş array olsa bile filtreyi uygula
      applyFilter(exams, filter);
    }
  }, [filter, exams, applyFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      if (editingExam) {
        // Güncelle
        console.log('📤 Güncellenecek sınav verisi:', {
          id: editingExam.id,
          formData: JSON.parse(JSON.stringify(formData)),
          isActive: formData.isActive,
          isActiveType: typeof formData.isActive,
          isActiveValue: formData.isActive === true ? 'true' : formData.isActive === false ? 'false' : 'undefined/null'
        });
        const response = await examAPI.updateExam(editingExam.id, formData);
        if (response.success) {
          console.log('✅ Sınav güncellendi, yanıt:', response.data);
          setMessage({ type: 'success', text: 'Sınav başarıyla güncellendi.' });
          setShowModal(false);
          resetForm();
          await loadExams();
        }
      } else {
        // Yeni oluştur
        const response = await examAPI.createExam(formData);
        if (response.success) {
          setMessage({ type: 'success', text: 'Sınav başarıyla oluşturuldu.' });
          setShowModal(false);
          resetForm();
          await loadExams();
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'İşlem sırasında bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      description: exam.description || '',
      code: exam.code,
      imageUrl: exam.imageUrl || '',
      price: exam.price ? parseFloat(exam.price).toString() : '',
      institution: exam.institution || '',
      category: exam.category || '',
      rating: exam.rating ? exam.rating.toString() : '4.8',
      enrolledCount: exam.enrolledCount ? exam.enrolledCount.toString() : '0',
      questionCount: exam.questionCount ? exam.questionCount.toString() : '0',
      isActive: exam.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (exam) => {
    if (!window.confirm(`"${exam.name}" sınavını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setProcessing(exam.id);
      const response = await examAPI.deleteExam(exam.id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Sınav başarıyla silindi.' });
        await loadExams();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Sınav silinirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      imageUrl: '',
      price: '',
      institution: '',
      category: '',
      rating: '',
      enrolledCount: '',
      isActive: true,
    });
    setEditingExam(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-exam-page">

      <div className="container">
        <div className="admin-header">
          <h1>📋 Sınav Yönetimi</h1>
          <button className="btn btn-success" onClick={openCreateModal}>
            + Yeni Sınav Ekle
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="exams-table-section">
          <div className="exams-header-controls">
            <h2>
              {filter === 'all' && `Tüm Sınavlar (${exams.length})`}
              {filter === 'active' && `Aktif Sınavlar (${filteredExams.length})`}
              {filter === 'inactive' && `Pasif Sınavlar (${filteredExams.length})`}
            </h2>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tümü ({exams.length})
              </button>
              <button
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Aktif ({exams.filter(e => e.isActive).length})
              </button>
              <button
                className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilter('inactive')}
              >
                Pasif ({exams.filter(e => !e.isActive).length})
              </button>
            </div>
          </div>
          {filteredExams.length === 0 ? (
            <div className="empty-state">
              <p>Henüz sınav bulunmamaktadır. Yeni sınav ekleyin.</p>
            </div>
          ) : (
            <div className="exams-grid">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="exam-card-admin">
                  {exam.imageUrl ? (
                    <div className="exam-image">
                      <img src={exam.imageUrl} alt={exam.name} />
                    </div>
                  ) : (
                    <div className="exam-image-placeholder">
                      <span>📚</span>
                    </div>
                  )}
                  <div className="exam-content">
                    <div className="exam-header-row">
                      <h3>{exam.name}</h3>
                      <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                        {exam.isActive ? 'AKTİF' : 'PASİF'}
                      </span>
                    </div>
                    <p className="exam-description">{exam.description || 'Açıklama yok'}</p>
                    <div className="exam-meta">
                      <span className="exam-code">Kod: {exam.code}</span>
                      <span className="exam-topics">📚 {exam._count?.topics || 0} Konu</span>
                    </div>
                    <div className="exam-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/yonetim/sinavlar/${exam.id}/icerik`)}
                      >
                        📝 İçerik Ekle
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleEdit(exam)}
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(exam)}
                        disabled={processing === exam.id}
                      >
                        {processing === exam.id ? 'Siliniyor...' : '🗑️ Sil'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal is effectively inside here due to how React renders, but simpler to just strip Footer */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          {/* ... modal content ... */}
          {/* Keeping the detailed form code here by reference to avoid huge context usage, just stripping the footer below */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingExam ? 'Sınav Düzenle' : 'Yeni Sınav Ekle'}</h3>
            <form onSubmit={handleSubmit}>
              {/* Form fields here */}
              <div className="form-group">
                <label>Sınav Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sınav hakkında açıklama..."
                />
              </div>

              <div className="form-group">
                <label>Kod * (örn: adalet-gys)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                  disabled={!!editingExam}
                  placeholder="adalet-gys"
                />
                {editingExam && (
                  <small className="form-help">Kod değiştirilemez.</small>
                )}
              </div>

              <div className="form-group">
                <label>Görsel URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="form-section-header">
                <h4>Promosyon Bilgileri</h4>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Kurum Adı</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Örn: Sağlık Bakanlığı"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Kategori</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Örn: SAĞLIK"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Puan (0-5)</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.8"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Öğrenci Sayısı</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.enrolledCount}
                    onChange={(e) => setFormData({ ...formData, enrolledCount: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Soru Sayısı</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.questionCount}
                    onChange={(e) => setFormData({ ...formData, questionCount: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fiyat (₺) *</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <small className="form-hint">Paket satın alma fiyatı (TL cinsinden)</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Aktif</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? 'İşleniyor...' : editingExam ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminExamPage;
