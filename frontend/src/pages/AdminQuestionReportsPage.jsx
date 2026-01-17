// Admin Question Reports Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminQuestionReportsPage.css';

function AdminQuestionReportsPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(''); // PENDING, REVIEWED, RESOLVED, REJECTED
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processing, setProcessing] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'MEDIUM',
    isPreviousExam: false,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/anasayfa');
      return;
    }
    if (user && user.role === 'ADMIN') {
      loadReports();
    }
  }, [user, authLoading, filterStatus]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestionReports(filterStatus || undefined);
      if (response.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Raporlar yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setProcessing(reportId);
      const response = await questionAPI.updateReportStatus(reportId, newStatus);
      if (response.success) {
        setMessage({ type: 'success', text: 'Rapor durumu güncellendi.' });
        await loadReports();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Durum güncellenirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const openEditModal = (report) => {
    const question = report.question;
    setEditingQuestion(question);

    // Soru tipine göre formu doldur
    if (question.type === 'TRUE_FALSE') {
      setQuestionForm({
        question: question.question || '',
        options: ['Doğru', 'Yanlış'],
        correctAnswer: question.correctAnswer || 0,
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'MEDIUM',
        isPreviousExam: question.isPreviousExam || false,
      });
    } else {
      // MULTIPLE_CHOICE
      const options = question.options && question.options.length > 0
        ? [...question.options, ...Array(5 - question.options.length).fill('')].slice(0, 5)
        : ['', '', '', '', ''];
      setQuestionForm({
        question: question.question || '',
        options: options,
        correctAnswer: question.correctAnswer || 0,
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'MEDIUM',
        isPreviousExam: question.isPreviousExam || false,
      });
    }
  };

  const closeEditModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'MEDIUM',
      isPreviousExam: false,
    });
  };

  const updateQuestionOption = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleQuestionUpdate = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      setProcessing('updating-question');
      setMessage({ type: '', text: '' });

      // Boş seçenekleri filtrele (MULTIPLE_CHOICE için)
      let filledOptions = questionForm.options;
      let correctAnswerIndex = questionForm.correctAnswer;

      if (editingQuestion.type === 'MULTIPLE_CHOICE') {
        // Boş olmayan seçenekleri al
        const filledOptionsWithIndex = questionForm.options
          .map((opt, idx) => ({ value: opt.trim(), originalIndex: idx }))
          .filter(item => item.value !== '');

        if (filledOptionsWithIndex.length < 2) {
          setMessage({ type: 'error', text: 'En az 2 seçenek doldurulmalıdır.' });
          setProcessing(null);
          return;
        }

        // Doğru cevabın yeni indeksini bul
        const originalCorrectIndex = questionForm.correctAnswer;
        const correctOption = questionForm.options[originalCorrectIndex];
        const newCorrectIndex = filledOptionsWithIndex.findIndex(
          item => item.originalIndex === originalCorrectIndex
        );

        if (newCorrectIndex === -1 || !correctOption.trim()) {
          setMessage({ type: 'error', text: 'Doğru cevap seçeneği doldurulmalıdır.' });
          setProcessing(null);
          return;
        }

        filledOptions = filledOptionsWithIndex.map(item => item.value);
        correctAnswerIndex = newCorrectIndex;
      } else {
        // TRUE_FALSE için
        filledOptions = ['Doğru', 'Yanlış'];
      }

      const updateData = {
        question: questionForm.question.trim(),
        type: editingQuestion.type,
        options: filledOptions,
        correctAnswer: correctAnswerIndex,
        explanation: questionForm.explanation?.trim() || '',
        difficulty: questionForm.difficulty,
        isPreviousExam: questionForm.isPreviousExam || false,
      };

      const response = await questionAPI.updateQuestion(editingQuestion.id, updateData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Soru başarıyla güncellendi.' });
        closeEditModal();
        await loadReports();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Soru güncellenirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'REVIEWED':
        return 'status-reviewed';
      case 'RESOLVED':
        return 'status-resolved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'REVIEWED':
        return 'İncelendi';
      case 'RESOLVED':
        return 'Çözüldü';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-reports-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports-page">

      <div className="container">
        <div className="page-header">
          <h1>⚠️ Hatalı Soru Bildirimleri</h1>
          <p>Kullanıcıların bildirdiği hatalı soruları buradan inceleyebilirsiniz.</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="filters">
          <label>Durum Filtresi:</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="PENDING">Beklemede</option>
            <option value="REVIEWED">İncelendi</option>
            <option value="RESOLVED">Çözüldü</option>
            <option value="REJECTED">Reddedildi</option>
          </select>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <p>📭 Henüz hatalı soru bildirimi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div className="report-meta">
                    <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                    <span className="report-date">
                      {new Date(report.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="report-user">
                    <strong>Bildiren:</strong> {report.user.name} ({report.user.email})
                  </div>
                </div>

                <div className="report-content">
                  <div className="question-info">
                    <h3>Soru Bilgileri</h3>
                    <p><strong>Soru ID:</strong> {report.question.id}</p>
                    <p><strong>Soru:</strong> {report.question.question}</p>
                    <p><strong>Sınav:</strong> {report.question.topic?.exam?.name || 'Bilinmiyor'}</p>
                    <p><strong>Konu:</strong> {report.question.topic?.name || 'Bilinmiyor'}</p>
                    <p><strong>Soru Tipi:</strong> {report.question.type === 'MULTIPLE_CHOICE' ? 'Çoktan Seçmeli' : 'Doğru/Yanlış'}</p>
                  </div>

                  <div className="report-details">
                    <h3>Bildirim Detayları</h3>
                    <p><strong>Hata Nedeni:</strong></p>
                    <div className="reason-text">{report.reason}</div>
                    {report.description && (
                      <>
                        <p><strong>Açıklama:</strong></p>
                        <div className="description-text">{report.description}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="report-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => openEditModal(report)}
                  >
                    ✏️ Soruyu Düzenle
                  </button>
                  <div className="status-actions">
                    <button
                      className={`btn btn-sm ${report.status === 'REVIEWED' ? 'btn-active' : 'btn-secondary'}`}
                      onClick={() => handleStatusUpdate(report.id, 'REVIEWED')}
                      disabled={processing === report.id || report.status === 'REVIEWED'}
                    >
                      {processing === report.id ? 'Güncelleniyor...' : 'İncelendi'}
                    </button>
                    <button
                      className={`btn btn-sm ${report.status === 'RESOLVED' ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                      disabled={processing === report.id || report.status === 'RESOLVED'}
                    >
                      {processing === report.id ? 'Güncelleniyor...' : 'Çözüldü'}
                    </button>
                    <button
                      className={`btn btn-sm ${report.status === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => handleStatusUpdate(report.id, 'REJECTED')}
                      disabled={processing === report.id || report.status === 'REJECTED'}
                    >
                      {processing === report.id ? 'Güncelleniyor...' : 'Reddet'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Soru Düzenleme Modal */}
        {editingQuestion && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content edit-question-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Soruyu Düzenle</h2>
                <button className="modal-close" onClick={closeEditModal}>×</button>
              </div>
              <form onSubmit={handleQuestionUpdate}>
                <div className="form-group">
                  <label>Soru Metni <span className="required">*</span></label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    required
                    placeholder="Soru metnini giriniz..."
                  />
                </div>

                {editingQuestion.type === 'MULTIPLE_CHOICE' ? (
                  <>
                    <div className="form-group">
                      <label>Seçenekler <span className="required">*</span> (En az 2 seçenek doldurulmalıdır)</label>
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="option-input">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={questionForm.correctAnswer === index}
                            onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                            disabled={!option.trim()}
                          />
                          <label style={{ minWidth: '120px', marginRight: '10px' }}>
                            {String.fromCharCode(65 + index)}. Seçenek:
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={option}
                            onChange={(e) => updateQuestionOption(index, e.target.value)}
                            placeholder={`Seçenek ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label>Doğru Cevap <span className="required">*</span></label>
                    <div className="option-input">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.correctAnswer === 0}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 0 })}
                      />
                      <label>Doğru</label>
                    </div>
                    <div className="option-input">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.correctAnswer === 1}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 1 })}
                      />
                      <label>Yanlış</label>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Açıklama</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    placeholder="Soru açıklaması (opsiyonel)..."
                  />
                </div>

                <div className="form-group">
                  <label>Zorluk Seviyesi</label>
                  <select
                    className="form-input"
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                  >
                    <option value="EASY">Kolay</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HARD">Zor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={questionForm.isPreviousExam || false}
                      onChange={(e) => setQuestionForm({ ...questionForm, isPreviousExam: e.target.checked })}
                    />
                    <span>Çıkmış Soru</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                    disabled={processing === 'updating-question'}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processing === 'updating-question'}
                  >
                    {processing === 'updating-question' ? 'Güncelleniyor...' : 'Güncelle'}
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

export default AdminQuestionReportsPage;
