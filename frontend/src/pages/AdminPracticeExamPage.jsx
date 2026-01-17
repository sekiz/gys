// Admin Practice Exam Page - Deneme Sınavı Yönetimi
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, questionAPI, practiceExamAPI } from '../services/api';
import './AdminPracticeExamPage.css';

function AdminPracticeExamPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [practiceExams, setPracticeExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('');
  const [randomCount, setRandomCount] = useState('');
  const [formData, setFormData] = useState({
    examId: '',
    title: '',
    description: '',
    duration: '',
    selectedQuestionIds: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR') {
      navigate('/anasayfa');
      return;
    }
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (selectedExamId) {
      loadTopicsAndQuestions();
    }
  }, [selectedExamId]);

  // Soruları filtrele
  useEffect(() => {
    let filtered = questions;

    // Arama terimi ile filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(term)
      );
    }

    // Konu ile filtrele
    if (selectedTopicFilter) {
      filtered = filtered.filter((q) => q.topicId === selectedTopicFilter);
    }

    // Zorluk seviyesi ile filtrele
    if (selectedDifficultyFilter) {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficultyFilter);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedTopicFilter, selectedDifficultyFilter]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examAPI.getExams();
      if (response.success) {
        setExams(response.data.exams);
      }
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
      setMessage({ type: 'error', text: 'Sınavlar yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsAndQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const [topicsResponse, questionsResponse] = await Promise.all([
        examAPI.getTopics(selectedExamId),
        questionAPI.getQuestions({ examId: selectedExamId }),
      ]);

      if (topicsResponse.success) {
        setTopics(topicsResponse.data.topics || []);
      }

      if (questionsResponse.success) {
        setQuestions(questionsResponse.data.questions || []);
      }

      // Seçili sınava ait deneme sınavlarını yükle
      const practiceResponse = await practiceExamAPI.getPracticeExamsByExam(selectedExamId);
      if (practiceResponse.success) {
        setPracticeExams(practiceResponse.data.practiceExams || []);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleExamSelect = (examId) => {
    setSelectedExamId(examId);
    setFormData({ ...formData, examId, selectedQuestionIds: [] });
  };

  const handleQuestionToggle = (questionId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedQuestionIds.includes(questionId);
      return {
        ...prev,
        selectedQuestionIds: isSelected
          ? prev.selectedQuestionIds.filter((id) => id !== questionId)
          : [...prev.selectedQuestionIds, questionId],
      };
    });
  };

  const handleSelectAll = () => {
    const questionsToSelect = filteredQuestions.length > 0 ? filteredQuestions : questions;
    if (formData.selectedQuestionIds.length === questionsToSelect.length &&
      questionsToSelect.every(q => formData.selectedQuestionIds.includes(q.id))) {
      // Tümünü kaldır
      setFormData({ ...formData, selectedQuestionIds: [] });
    } else {
      // Filtrelenmiş soruları seç
      const newSelected = [...new Set([...formData.selectedQuestionIds, ...questionsToSelect.map((q) => q.id)])];
      setFormData({ ...formData, selectedQuestionIds: newSelected });
    }
  };

  const handleSelectByTopic = (topicId) => {
    const topicQuestions = questions.filter((q) => q.topicId === topicId);
    const topicQuestionIds = topicQuestions.map((q) => q.id);
    const allSelected = topicQuestionIds.every((id) => formData.selectedQuestionIds.includes(id));

    if (allSelected) {
      // Tümünü kaldır
      setFormData({
        ...formData,
        selectedQuestionIds: formData.selectedQuestionIds.filter((id) => !topicQuestionIds.includes(id)),
      });
    } else {
      // Tümünü seç
      const newSelected = [...new Set([...formData.selectedQuestionIds, ...topicQuestionIds])];
      setFormData({ ...formData, selectedQuestionIds: newSelected });
    }
  };

  const handleSelectRandom = () => {
    if (!randomCount || parseInt(randomCount) <= 0) {
      setMessage({ type: 'error', text: 'Lütfen geçerli bir sayı giriniz.' });
      return;
    }

    const questionsToSelect = filteredQuestions.length > 0 ? filteredQuestions : questions;
    const count = Math.min(parseInt(randomCount), questionsToSelect.length);
    const shuffled = [...questionsToSelect].sort(() => 0.5 - Math.random());
    const randomQuestions = shuffled.slice(0, count);
    const randomIds = randomQuestions.map((q) => q.id);

    setFormData({
      ...formData,
      selectedQuestionIds: [...new Set([...formData.selectedQuestionIds, ...randomIds])],
    });
    setRandomCount('');
    setMessage({ type: 'success', text: `${count} soru rastgele seçildi.` });
  };

  const handleClearSelection = () => {
    setFormData({ ...formData, selectedQuestionIds: [] });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTopicFilter('');
    setSelectedDifficultyFilter('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      if (formData.selectedQuestionIds.length === 0) {
        setMessage({ type: 'error', text: 'En az bir soru seçmelisiniz.' });
        setProcessing(false);
        return;
      }

      if (editingExam) {
        // Güncelle
        const response = await practiceExamAPI.updatePracticeExam(editingExam.id, {
          title: formData.title,
          description: formData.description,
          duration: parseInt(formData.duration),
          questionIds: formData.selectedQuestionIds,
        });
        if (response.success) {
          setMessage({ type: 'success', text: 'Deneme sınavı başarıyla güncellendi.' });
          setShowModal(false);
          resetForm();
          await loadTopicsAndQuestions();
        }
      } else {
        // Yeni oluştur
        const response = await practiceExamAPI.createPracticeExam({
          examId: formData.examId,
          title: formData.title,
          description: formData.description,
          duration: parseInt(formData.duration),
          questionIds: formData.selectedQuestionIds,
        });
        if (response.success) {
          setMessage({ type: 'success', text: 'Deneme sınavı başarıyla oluşturuldu.' });
          setShowModal(false);
          resetForm();
          await loadTopicsAndQuestions();
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'İşlem sırasında bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (practiceExam) => {
    setEditingExam(practiceExam);
    setFormData({
      examId: practiceExam.examId,
      title: practiceExam.title,
      description: practiceExam.description || '',
      duration: practiceExam.duration.toString(),
      selectedQuestionIds: practiceExam.questions?.map((tq) => tq.questionId) || [],
    });
    setSelectedExamId(practiceExam.examId);
    setShowModal(true);
  };

  const handleDelete = async (practiceExam) => {
    if (!window.confirm(`"${practiceExam.title}" deneme sınavını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setProcessing(practiceExam.id);
      const response = await practiceExamAPI.deletePracticeExam(practiceExam.id);
      if (response.success) {
        setMessage({ type: 'success', text: 'Deneme sınavı başarıyla silindi.' });
        await loadTopicsAndQuestions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Deneme sınavı silinirken bir hata oluştu.' });
    } finally {
      setProcessing(null);
    }
  };

  const resetForm = () => {
    setFormData({
      examId: selectedExamId,
      title: '',
      description: '',
      duration: '',
      selectedQuestionIds: [],
    });
    setEditingExam(null);
    // Filtreleri de sıfırla
    setSearchTerm('');
    setSelectedTopicFilter('');
    setSelectedDifficultyFilter('');
    setRandomCount('');
  };

  const openCreateModal = () => {
    if (!selectedExamId) {
      setMessage({ type: 'error', text: 'Lütfen önce bir sınav seçiniz.' });
      return;
    }
    resetForm();
    setFormData({ ...formData, examId: selectedExamId });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="admin-practice-exam-page">
      <div className="admin-header">
        <h1>📝 Deneme Sınavı Yönetimi</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Sınav Seçimi */}
      <div className="exam-selection-section">
        <h2>Sınav Seçin</h2>
        <div className="exams-grid">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`exam-select-card ${selectedExamId === exam.id ? 'selected' : ''}`}
              onClick={() => handleExamSelect(exam.id)}
            >
              <h3>{exam.name}</h3>
              <p>{exam.description || 'Açıklama yok'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seçili Sınava Ait Deneme Sınavları ve Sorular */}
      {selectedExamId && (
        <>
          <div className="practice-exams-section">
            <div className="section-header">
              <h2>
                Deneme Sınavları ({practiceExams.length})
              </h2>
              <button className="btn btn-primary" onClick={openCreateModal}>
                + Yeni Deneme Sınavı Ekle
              </button>
            </div>

            {loadingQuestions ? (
              <div className="loading">Yükleniyor...</div>
            ) : practiceExams.length === 0 ? (
              <div className="empty-state">
                <p>Bu sınava ait deneme sınavı bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="practice-exams-grid">
                {practiceExams.map((exam) => (
                  <div key={exam.id} className="practice-exam-card-admin">
                    <div className="exam-card-header">
                      <h3>{exam.title}</h3>
                      <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                        {exam.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    {exam.description && (
                      <p className="exam-description">{exam.description}</p>
                    )}
                    <div className="exam-meta">
                      <span>⏱️ {exam.duration} dakika</span>
                      <span>📝 {exam._count?.questions || exam.questionCount} soru</span>
                    </div>
                    <div className="exam-actions">
                      <button
                        className="btn btn-primary btn-sm"
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
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedExamId && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>{editingExam ? 'Deneme Sınavı Düzenle' : 'Yeni Deneme Sınavı Ekle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Örn: Adalet GYS Deneme Sınavı 1"
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deneme sınavı hakkında açıklama..."
                />
              </div>

              <div className="form-group">
                <label>Süre (dakika) *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  placeholder="60"
                />
              </div>

              <div className="form-group">
                <div className="question-selection-header">
                  <label>Soruları Seçin *</label>
                  <div className="selection-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleSelectAll}
                    >
                      {filteredQuestions.length > 0
                        ? filteredQuestions.every(q => formData.selectedQuestionIds.includes(q.id))
                          ? 'Filtrelenmişleri Kaldır'
                          : 'Filtrelenmişleri Seç'
                        : formData.selectedQuestionIds.length === questions.length
                          ? 'Tümünü Kaldır'
                          : 'Tümünü Seç'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleClearSelection}
                    >
                      Seçimi Temizle
                    </button>
                  </div>
                </div>
                <div className="question-selection-info">
                  {formData.selectedQuestionIds.length} / {questions.length} soru seçildi
                  {filteredQuestions.length > 0 && filteredQuestions.length < questions.length && (
                    <span className="filter-info"> ({filteredQuestions.length} soru filtrelendi)</span>
                  )}
                </div>

                {/* Filtreleme ve Arama */}
                <div className="question-filters">
                  <div className="filter-row">
                    <input
                      type="text"
                      className="form-input filter-input"
                      placeholder="🔍 Soru metninde ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className="form-select filter-select"
                      value={selectedTopicFilter}
                      onChange={(e) => setSelectedTopicFilter(e.target.value)}
                    >
                      <option value="">Tüm Konular</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-select filter-select"
                      value={selectedDifficultyFilter}
                      onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                    >
                      <option value="">Tüm Zorluklar</option>
                      <option value="EASY">Kolay</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HARD">Zor</option>
                    </select>
                    {(searchTerm || selectedTopicFilter || selectedDifficultyFilter) && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleClearFilters}
                        title="Filtreleri Temizle"
                      >
                        ✕ Temizle
                      </button>
                    )}
                  </div>

                  {/* Rastgele Seçim */}
                  <div className="random-selection">
                    <input
                      type="number"
                      className="form-input random-input"
                      placeholder="Rastgele soru sayısı"
                      min="1"
                      max={filteredQuestions.length > 0 ? filteredQuestions.length : questions.length}
                      value={randomCount}
                      onChange={(e) => setRandomCount(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleSelectRandom}
                      disabled={!randomCount || parseInt(randomCount) <= 0}
                    >
                      🎲 Rastgele Seç
                    </button>
                  </div>

                  {/* Konu Bazlı Toplu Seçim */}
                  {topics.length > 0 && (
                    <div className="topic-bulk-selection">
                      <label>Konu Bazlı Toplu Seçim:</label>
                      <div className="topic-buttons">
                        {topics.map((topic) => {
                          const topicQuestions = questions.filter((q) => q.topicId === topic.id);
                          const allSelected = topicQuestions.length > 0 &&
                            topicQuestions.every((q) => formData.selectedQuestionIds.includes(q.id));
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              className={`btn btn-sm ${allSelected ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => handleSelectByTopic(topic.id)}
                              title={`${topic.name}: ${topicQuestions.length} soru`}
                            >
                              {allSelected ? '✓' : ''} {topic.name} ({topicQuestions.length})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="questions-selection-list">
                  {(filteredQuestions.length > 0 ? filteredQuestions : questions).length === 0 ? (
                    <p className="no-questions">
                      {searchTerm || selectedTopicFilter || selectedDifficultyFilter
                        ? 'Filtre kriterlerine uygun soru bulunamadı.'
                        : 'Bu sınava ait soru bulunmamaktadır.'}
                    </p>
                  ) : (
                    (filteredQuestions.length > 0 ? filteredQuestions : questions).map((question) => (
                      <div
                        key={question.id}
                        className={`question-selection-item ${formData.selectedQuestionIds.includes(question.id) ? 'selected' : ''
                          }`}
                        onClick={() => handleQuestionToggle(question.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedQuestionIds.includes(question.id)}
                          onChange={() => handleQuestionToggle(question.id)}
                        />
                        <div className="question-preview">
                          <div className="question-text-preview">
                            {question.question.length > 100
                              ? `${question.question.substring(0, 100)}...`
                              : question.question}
                          </div>
                          <div className="question-meta">
                            <span className="topic-name">
                              {topics.find((t) => t.id === question.topicId)?.name || 'Bilinmeyen Konu'}
                            </span>
                            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                              {question.difficulty === 'EASY' ? 'Kolay' : question.difficulty === 'MEDIUM' ? 'Orta' : 'Zor'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                  disabled={processing || formData.selectedQuestionIds.length === 0}
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

export default AdminPracticeExamPage;
