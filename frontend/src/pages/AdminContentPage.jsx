// Admin Content Page - İçerik Ekleme Sayfası
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, questionAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminContentPage.css';

// HTML entity'leri decode et
function decodeHtmlEntities(text) {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

const CONTENT_TYPES = {
  TOPIC: 'topic',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  ARTICLE: 'article',
  SUMMARY: 'summary',
};

function AdminContentPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [exam, setExam] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [topicForm, setTopicForm] = useState({ name: '', description: '', order: 0 });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'MULTIPLE_CHOICE',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'MEDIUM',
    isPreviousExam: false,
  });
  const [articleForm, setArticleForm] = useState({ title: '', content: '', order: 0 });
  const [summaryForm, setSummaryForm] = useState({ title: '', content: '', order: 0 });
  const [editingItem, setEditingItem] = useState(null); // Düzenlenen öğe (topic, question, test)
  const [editingType, setEditingType] = useState(null); // Düzenlenen öğe tipi

  // Mevcut içerikler için state'ler
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentArticles, setCurrentArticles] = useState([]);
  const [currentSummaries, setCurrentSummaries] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (authLoading) {
      return;
    }

    // User yoksa veya admin değilse yönlendir
    if (!user || user?.role !== 'ADMIN') {
      navigate('/anasayfa');
      return;
    }

    loadData();
  }, [examId, user, navigate, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examResponse, topicsResponse] = await Promise.all([
        examAPI.getExam(examId),
        examAPI.getTopics(examId),
      ]);

      if (examResponse.success) {
        setExam(examResponse.data.exam);
      }

      if (topicsResponse.success) {
        setTopics(topicsResponse.data.topics);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setMessage({ type: 'error', text: 'Veriler yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      const response = await examAPI.createTopic({
        examId,
        ...topicForm,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Konu başarıyla oluşturuldu.' });
        setTopicForm({ name: '', description: '', order: 0 });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Konu oluşturulurken bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      setMessage({ type: 'error', text: 'Lütfen bir konu seçiniz.' });
      return;
    }

    // Boş seçenekleri filtrele ve indeksleri koru
    const filledOptionsWithIndex = questionForm.options
      .map((opt, index) => ({ value: opt.trim(), originalIndex: index }))
      .filter(item => item.value !== '');

    // En az 2 seçenek dolu olmalı
    if (filledOptionsWithIndex.length < 2) {
      setMessage({ type: 'error', text: 'En az 2 seçenek doldurulmalıdır.' });
      return;
    }

    // Doğru cevabın orijinal indeksini bul
    const originalCorrectIndex = questionForm.correctAnswer;
    const correctOption = questionForm.options[originalCorrectIndex];

    // Orijinal indeksteki seçenek dolu mu kontrol et
    if (!correctOption || correctOption.trim() === '') {
      setMessage({ type: 'error', text: 'Lütfen doğru cevabı seçiniz (bir seçeneğin yanındaki radio butonunu işaretleyiniz).' });
      return;
    }

    // Filtrelenmiş array'de doğru cevabın yeni indeksini bul
    const newCorrectIndex = filledOptionsWithIndex.findIndex(
      item => item.originalIndex === originalCorrectIndex
    );

    if (newCorrectIndex === -1) {
      setMessage({ type: 'error', text: 'Doğru cevap seçeneği bulunamadı. Lütfen tekrar deneyiniz.' });
      return;
    }

    // Sadece değerleri al (filtrelenmiş seçenekler)
    const filledOptions = filledOptionsWithIndex.map(item => item.value);

    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      let response;
      if (editingItem && editingType === 'question') {
        // Güncelle
        response = await questionAPI.updateQuestion(editingItem.id, {
          question: questionForm.question.trim(),
          type: 'MULTIPLE_CHOICE',
          options: filledOptions,
          correctAnswer: newCorrectIndex,
          explanation: questionForm.explanation?.trim() || '',
          difficulty: questionForm.difficulty,
          isPreviousExam: Boolean(questionForm.isPreviousExam),
        });
      } else {
        // Yeni oluştur
        response = await questionAPI.createQuestion({
          topicId: selectedTopic,
          question: questionForm.question.trim(),
          type: 'MULTIPLE_CHOICE',
          options: filledOptions,
          correctAnswer: newCorrectIndex,
          explanation: questionForm.explanation?.trim() || '',
          difficulty: questionForm.difficulty,
          isPreviousExam: Boolean(questionForm.isPreviousExam),
        });
      }

      if (response.success) {
        setMessage({ type: 'success', text: editingItem ? 'Soru başarıyla güncellendi.' : 'Soru başarıyla oluşturuldu.' });
        setQuestionForm({
          question: '',
          type: 'MULTIPLE_CHOICE',
          options: ['', '', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          difficulty: 'MEDIUM',
          isPreviousExam: false,
        });
        setEditingItem(null);
        setEditingType(null);
        await loadCurrentContent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Soru oluşturulurken bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      setMessage({ type: 'error', text: 'Lütfen bir konu seçiniz.' });
      return;
    }

    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      let response;
      if (editingItem && editingType === 'article') {
        // Güncelle
        response = await examAPI.updateArticle(editingItem.id, {
          ...articleForm,
        });
      } else {
        // Yeni oluştur
        response = await examAPI.createArticle({
          topicId: selectedTopic,
          ...articleForm,
        });
      }

      if (response.success) {
        setMessage({ type: 'success', text: editingItem ? 'Konu anlatımı başarıyla güncellendi.' : 'Konu anlatımı başarıyla oluşturuldu.' });
        setArticleForm({ title: '', content: '', order: 0 });
        setEditingItem(null);
        setEditingType(null);
        await loadCurrentContent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Konu anlatımı oluşturulurken bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      setMessage({ type: 'error', text: 'Lütfen bir konu seçiniz.' });
      return;
    }

    try {
      setProcessing(true);
      setMessage({ type: '', text: '' });

      let response;
      if (editingItem && editingType === 'summary') {
        // Güncelle
        response = await examAPI.updateSummary(editingItem.id, {
          ...summaryForm,
        });
      } else {
        // Yeni oluştur
        response = await examAPI.createSummary({
          topicId: selectedTopic,
          ...summaryForm,
        });
      }

      if (response.success) {
        setMessage({ type: 'success', text: editingItem ? 'Konu özeti başarıyla güncellendi.' : 'Konu özeti başarıyla oluşturuldu.' });
        setSummaryForm({ title: '', content: '', order: 0 });
        setEditingItem(null);
        setEditingType(null);
        await loadCurrentContent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Konu özeti oluşturulurken bir hata oluştu.' });
    } finally {
      setProcessing(false);
    }
  };


  const updateQuestionOption = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  // Seçili konuya göre mevcut içerikleri yükle
  const loadCurrentContent = async () => {
    if (!selectedTopic) {
      setCurrentQuestions([]);
      setCurrentArticles([]);
      setCurrentSummaries([]);
      return;
    }

    try {
      setLoadingContent(true);
      const [questionsResponse, articlesResponse, summariesResponse] = await Promise.all([
        questionAPI.getQuestions({ topicId: selectedTopic }).catch(() => ({ success: false, data: { questions: [] } })),
        examAPI.getArticles(selectedTopic).catch(() => ({ success: false, data: { articles: [] } })),
        examAPI.getSummaries(selectedTopic).catch(() => ({ success: false, data: { summaries: [] } })),
      ]);

      if (questionsResponse.success) {
        setCurrentQuestions(questionsResponse.data.questions || []);
      }
      if (articlesResponse.success) {
        setCurrentArticles(articlesResponse.data.articles || []);
      }
      if (summariesResponse.success) {
        setCurrentSummaries(summariesResponse.data.summaries || []);
      }
    } catch (error) {
      console.error('İçerik yükleme hatası:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  // selectedTopic veya contentType değiştiğinde içerikleri yükle
  useEffect(() => {
    if (selectedTopic && (contentType === CONTENT_TYPES.MULTIPLE_CHOICE ||
      contentType === CONTENT_TYPES.TRUE_FALSE ||
      contentType === CONTENT_TYPES.ARTICLE ||
      contentType === CONTENT_TYPES.SUMMARY)) {
      loadCurrentContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, contentType]);

  // Auth yükleniyor veya user yoksa bekle
  if (authLoading || !user) {
    return <div className="loading">Yükleniyor...</div>;
  }

  // Admin kontrolü
  if (user?.role !== 'ADMIN') {
    return null; // useEffect zaten yönlendirecek
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!exam) {
    return <div className="error">Sınav bulunamadı</div>;
  }

  return (
    <div className="admin-content-page">

      <div className="container">
        <div className="content-header">
          <h1>📝 İçerik Ekle / Düzenle</h1>
          <h2>{exam.name}</h2>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* İçerik Tipi Seçimi */}
        <div className="content-type-selector">
          <h3>İçerik Tipi Seçiniz:</h3>
          <div className="content-type-buttons">
            <button
              className={`btn ${contentType === CONTENT_TYPES.TOPIC ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setContentType(CONTENT_TYPES.TOPIC)}
            >
              📚 Yeni Konu
            </button>
            <button
              className={`btn ${contentType === CONTENT_TYPES.MULTIPLE_CHOICE ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setContentType(CONTENT_TYPES.MULTIPLE_CHOICE);
                // Form state'ini çoktan seçmeli soru için sıfırla
                setQuestionForm({
                  question: '',
                  type: 'MULTIPLE_CHOICE',
                  options: ['', '', '', '', ''],
                  correctAnswer: 0,
                  explanation: '',
                  difficulty: 'MEDIUM',
                  isPreviousExam: false,
                });
              }}
            >
              ✅ Çoktan Seçmeli Soru
            </button>
            <button
              className={`btn ${contentType === CONTENT_TYPES.TRUE_FALSE ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setContentType(CONTENT_TYPES.TRUE_FALSE);
                // Form state'ini doğru/yanlış soru için sıfırla
                setQuestionForm({
                  question: '',
                  type: 'TRUE_FALSE',
                  options: ['Doğru', 'Yanlış'],
                  correctAnswer: 0,
                  explanation: '',
                  difficulty: 'MEDIUM',
                });
              }}
            >
              ✓✗ Doğru/Yanlış Soru
            </button>
            <button
              className={`btn ${contentType === CONTENT_TYPES.ARTICLE ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setContentType(CONTENT_TYPES.ARTICLE)}
            >
              📄 Konu Anlatımı
            </button>
            <button
              className={`btn ${contentType === CONTENT_TYPES.SUMMARY ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setContentType(CONTENT_TYPES.SUMMARY)}
            >
              📝 Konu Özeti
            </button>
          </div>
        </div>

        {/* Konu Seçimi (Soru, Article, Summary için) */}
        {(contentType === CONTENT_TYPES.MULTIPLE_CHOICE ||
          contentType === CONTENT_TYPES.TRUE_FALSE ||
          contentType === CONTENT_TYPES.ARTICLE ||
          contentType === CONTENT_TYPES.SUMMARY) && (
            <div className="topic-selector">
              <label>Konu Seçiniz: *</label>
              <select
                className="form-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
              >
                <option value="">Konu Seçiniz</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              {topics.length === 0 && (
                <p className="form-help">Önce bir konu oluşturmanız gerekmektedir.</p>
              )}
            </div>
          )}

        {/* Konu Oluşturma/Düzenleme Formu */}
        {contentType === CONTENT_TYPES.TOPIC && (
          <div className="content-form">
            <h3>{editingItem && editingType === 'topic' ? 'Konu Düzenle' : 'Yeni Konu Oluştur'}</h3>
            <form onSubmit={handleTopicSubmit}>
              <div className="form-group">
                <label>Konu Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Sıra</label>
                <input
                  type="number"
                  className="form-input"
                  value={topicForm.order}
                  onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={processing}>
                {processing ? 'Oluşturuluyor...' : 'Konu Oluştur'}
              </button>
            </form>
          </div>
        )}

        {/* Çoktan Seçmeli Soru Formu */}
        {contentType === CONTENT_TYPES.MULTIPLE_CHOICE && (
          <div className="content-form">
            <h3>{editingItem && editingType === 'question' ? 'Çoktan Seçmeli Soru Düzenle' : 'Çoktan Seçmeli Soru Ekle'}</h3>
            <form onSubmit={handleQuestionSubmit}>
              <div className="form-group">
                <label>Soru Metni *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Seçenekler * (5 seçenek giriniz)</label>
                {questionForm.options && questionForm.options.length > 0 ? (
                  questionForm.options.map((option, index) => (
                    <div key={index} className="option-input">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.correctAnswer === index}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
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
                        required
                      />
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#f44336' }}>⚠️ Seçenekler yüklenemedi. Lütfen sayfayı yenileyin.</p>
                )}
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Zorluk</label>
                <select
                  className="form-select"
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
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={processing || !selectedTopic}>
                  {processing ? (editingItem ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (editingItem ? 'Güncelle' : 'Soru Oluştur')}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingItem(null);
                      setEditingType(null);
                      setQuestionForm({
                        question: '',
                        type: 'MULTIPLE_CHOICE',
                        options: ['', '', '', '', ''],
                        correctAnswer: 0,
                        explanation: '',
                        difficulty: 'MEDIUM',
                        isPreviousExam: false,
                      });
                    }}
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            {/* Mevcut Çoktan Seçmeli Sorular */}
            {selectedTopic && (
              <div className="existing-content-list">
                <h4>Mevcut Çoktan Seçmeli Sorular ({currentQuestions.filter(q => q.type === 'MULTIPLE_CHOICE').length})</h4>
                {loadingContent ? (
                  <div className="loading">Yükleniyor...</div>
                ) : currentQuestions.filter(q => q.type === 'MULTIPLE_CHOICE').length === 0 ? (
                  <p className="empty-state">Henüz çoktan seçmeli soru eklenmemiş.</p>
                ) : (
                  <div className="content-items">
                    {currentQuestions.filter(q => q.type === 'MULTIPLE_CHOICE').map((question) => (
                      <div key={question.id} className="content-item">
                        <div className="content-item-info">
                          <h5>{decodeHtmlEntities(question.question)}</h5>
                          <div className="content-item-meta">
                            <span>Zorluk: {question.difficulty === 'EASY' ? 'Kolay' : question.difficulty === 'MEDIUM' ? 'Orta' : 'Zor'}</span>
                            <span>Seçenekler: {question.options?.length || 0}</span>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => {
                              setEditingItem(question);
                              setEditingType('question');
                              // Eğer soru 4 şıkla kaydedilmişse, 5 şık göster (4'ü dolu, 1'i boş)
                              const existingOptions = question.options && question.options.length > 0 ? question.options : [];
                              const optionsArray = existingOptions.length < 5
                                ? [...existingOptions, ...Array(5 - existingOptions.length).fill('')]
                                : existingOptions.slice(0, 5);
                              setQuestionForm({
                                question: question.question,
                                type: 'MULTIPLE_CHOICE',
                                options: optionsArray,
                                correctAnswer: question.correctAnswer || 0,
                                explanation: question.explanation || '',
                                difficulty: question.difficulty || 'MEDIUM',
                                isPreviousExam: Boolean(question.isPreviousExam),
                              });
                            }}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={async () => {
                              if (window.confirm(`"${decodeHtmlEntities(question.question).substring(0, 50)}..." sorusunu silmek istediğinize emin misiniz?`)) {
                                try {
                                  setProcessing(question.id);
                                  const response = await questionAPI.deleteQuestion(question.id);
                                  if (response.success) {
                                    setMessage({ type: 'success', text: 'Soru başarıyla silindi.' });
                                    await loadCurrentContent();
                                  }
                                } catch (error) {
                                  setMessage({ type: 'error', text: error.message || 'Soru silinirken bir hata oluştu.' });
                                } finally {
                                  setProcessing(null);
                                }
                              }
                            }}
                            disabled={processing === question.id}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Doğru/Yanlış Soru Formu */}
        {contentType === CONTENT_TYPES.TRUE_FALSE && (
          <div className="content-form">
            <h3>{editingItem && editingType === 'question' ? 'Doğru/Yanlış Soru Düzenle' : 'Doğru/Yanlış Soru Ekle'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedTopic) {
                setMessage({ type: 'error', text: 'Lütfen bir konu seçiniz.' });
                return;
              }

              try {
                setProcessing(true);
                setMessage({ type: '', text: '' });

                let response;
                if (editingItem && editingType === 'question') {
                  // Güncelle
                  response = await questionAPI.updateQuestion(editingItem.id, {
                    question: questionForm.question,
                    type: 'TRUE_FALSE',
                    options: ['Doğru', 'Yanlış'],
                    correctAnswer: questionForm.correctAnswer,
                    explanation: questionForm.explanation,
                    difficulty: questionForm.difficulty,
                    isPreviousExam: Boolean(questionForm.isPreviousExam),
                  });
                } else {
                  // Yeni oluştur
                  response = await questionAPI.createQuestion({
                    topicId: selectedTopic,
                    question: questionForm.question,
                    type: 'TRUE_FALSE',
                    options: ['Doğru', 'Yanlış'],
                    correctAnswer: questionForm.correctAnswer,
                    explanation: questionForm.explanation,
                    difficulty: questionForm.difficulty,
                    isPreviousExam: Boolean(questionForm.isPreviousExam),
                  });
                }

                if (response.success) {
                  setMessage({ type: 'success', text: editingItem ? 'Soru başarıyla güncellendi.' : 'Soru başarıyla oluşturuldu.' });
                  setQuestionForm({
                    question: '',
                    type: 'TRUE_FALSE',
                    options: ['Doğru', 'Yanlış'],
                    correctAnswer: 0,
                    explanation: '',
                    difficulty: 'MEDIUM',
                  });
                  setEditingItem(null);
                  setEditingType(null);
                  await loadCurrentContent();
                }
              } catch (error) {
                setMessage({ type: 'error', text: error.message || 'Soru oluşturulurken bir hata oluştu.' });
              } finally {
                setProcessing(false);
              }
            }}>
              <div className="form-group">
                <label>Soru Metni *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Doğru Cevap *</label>
                <select
                  className="form-select"
                  value={questionForm.correctAnswer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })}
                >
                  <option value={0}>Doğru</option>
                  <option value={1}>Yanlış</option>
                </select>
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Zorluk</label>
                <select
                  className="form-select"
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                >
                  <option value="EASY">Kolay</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HARD">Zor</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing || !selectedTopic}
                >
                  {processing ? (editingItem ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (editingItem ? 'Güncelle' : 'Soru Oluştur')}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingItem(null);
                      setEditingType(null);
                      setQuestionForm({
                        question: '',
                        type: 'TRUE_FALSE',
                        options: ['Doğru', 'Yanlış'],
                        correctAnswer: 0,
                        explanation: '',
                        difficulty: 'MEDIUM',
                      });
                    }}
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            {/* Mevcut Doğru/Yanlış Sorular */}
            {selectedTopic && (
              <div className="existing-content-list">
                <h4>Mevcut Doğru/Yanlış Sorular ({currentQuestions.filter(q => q.type === 'TRUE_FALSE').length})</h4>
                {loadingContent ? (
                  <div className="loading">Yükleniyor...</div>
                ) : currentQuestions.filter(q => q.type === 'TRUE_FALSE').length === 0 ? (
                  <p className="empty-state">Henüz doğru/yanlış soru eklenmemiş.</p>
                ) : (
                  <div className="content-items">
                    {currentQuestions.filter(q => q.type === 'TRUE_FALSE').map((question) => (
                      <div key={question.id} className="content-item">
                        <div className="content-item-info">
                          <h5>{decodeHtmlEntities(question.question)}</h5>
                          <div className="content-item-meta">
                            <span>Doğru Cevap: {question.correctAnswer === 0 ? 'Doğru' : 'Yanlış'}</span>
                            <span>Zorluk: {question.difficulty === 'EASY' ? 'Kolay' : question.difficulty === 'MEDIUM' ? 'Orta' : 'Zor'}</span>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => {
                              setEditingItem(question);
                              setEditingType('question');
                              setQuestionForm({
                                question: question.question,
                                type: 'TRUE_FALSE',
                                options: ['Doğru', 'Yanlış'],
                                correctAnswer: question.correctAnswer || 0,
                                explanation: question.explanation || '',
                                difficulty: question.difficulty || 'MEDIUM',
                              });
                            }}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={async () => {
                              if (window.confirm(`"${decodeHtmlEntities(question.question).substring(0, 50)}..." sorusunu silmek istediğinize emin misiniz?`)) {
                                try {
                                  setProcessing(question.id);
                                  const response = await questionAPI.deleteQuestion(question.id);
                                  if (response.success) {
                                    setMessage({ type: 'success', text: 'Soru başarıyla silindi.' });
                                    await loadCurrentContent();
                                  }
                                } catch (error) {
                                  setMessage({ type: 'error', text: error.message || 'Soru silinirken bir hata oluştu.' });
                                } finally {
                                  setProcessing(null);
                                }
                              }
                            }}
                            disabled={processing === question.id}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Konu Anlatımı Formu */}
        {contentType === CONTENT_TYPES.ARTICLE && (
          <div className="content-form">
            <h3>{editingItem && editingType === 'article' ? 'Konu Anlatımı Düzenle' : 'Konu Anlatımı Ekle'}</h3>
            <form onSubmit={handleArticleSubmit}>
              <div className="form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  className="form-input"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>İçerik *</label>
                <textarea
                  className="form-input"
                  rows="10"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sıra</label>
                <input
                  type="number"
                  className="form-input"
                  value={articleForm.order}
                  onChange={(e) => setArticleForm({ ...articleForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={processing || !selectedTopic}>
                  {processing ? (editingItem ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (editingItem ? 'Güncelle' : 'Konu Anlatımı Oluştur')}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingItem(null);
                      setEditingType(null);
                      setArticleForm({ title: '', content: '', order: 0 });
                    }}
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            {/* Mevcut Konu Anlatımları */}
            {selectedTopic && (
              <div className="existing-content-list">
                <h4>Mevcut Konu Anlatımları ({currentArticles.length})</h4>
                {loadingContent ? (
                  <div className="loading">Yükleniyor...</div>
                ) : currentArticles.length === 0 ? (
                  <p className="empty-state">Henüz konu anlatımı eklenmemiş.</p>
                ) : (
                  <div className="content-items">
                    {currentArticles.map((article) => (
                      <div key={article.id} className="content-item">
                        <div className="content-item-info">
                          <h5>{article.title}</h5>
                          <div className="content-item-meta">
                            <span>Sıra: {article.order || 0}</span>
                            <span>İçerik: {article.content?.substring(0, 100)}...</span>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => {
                              setEditingItem(article);
                              setEditingType('article');
                              setArticleForm({
                                title: article.title,
                                content: article.content,
                                order: article.order || 0,
                              });
                            }}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={async () => {
                              if (window.confirm(`"${article.title}" anlatımını silmek istediğinize emin misiniz?`)) {
                                try {
                                  setProcessing(article.id);
                                  const response = await examAPI.deleteArticle(article.id);
                                  if (response.success) {
                                    setMessage({ type: 'success', text: 'Konu anlatımı başarıyla silindi.' });
                                    await loadCurrentContent();
                                  }
                                } catch (error) {
                                  setMessage({ type: 'error', text: error.message || 'Konu anlatımı silinirken bir hata oluştu.' });
                                } finally {
                                  setProcessing(null);
                                }
                              }
                            }}
                            disabled={processing === article.id}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Konu Özeti Formu */}
        {contentType === CONTENT_TYPES.SUMMARY && (
          <div className="content-form">
            <h3>{editingItem && editingType === 'summary' ? 'Konu Özeti Düzenle' : 'Konu Özeti Ekle'}</h3>
            <form onSubmit={handleSummarySubmit}>
              <div className="form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  className="form-input"
                  value={summaryForm.title}
                  onChange={(e) => setSummaryForm({ ...summaryForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>İçerik *</label>
                <textarea
                  className="form-input"
                  rows="10"
                  value={summaryForm.content}
                  onChange={(e) => setSummaryForm({ ...summaryForm, content: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sıra</label>
                <input
                  type="number"
                  className="form-input"
                  value={summaryForm.order}
                  onChange={(e) => setSummaryForm({ ...summaryForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={processing || !selectedTopic}>
                  {processing ? (editingItem ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (editingItem ? 'Güncelle' : 'Konu Özeti Oluştur')}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingItem(null);
                      setEditingType(null);
                      setSummaryForm({ title: '', content: '', order: 0 });
                    }}
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            {/* Mevcut Konu Özetleri */}
            {selectedTopic && (
              <div className="existing-content-list">
                <h4>Mevcut Konu Özetleri ({currentSummaries.length})</h4>
                {loadingContent ? (
                  <div className="loading">Yükleniyor...</div>
                ) : currentSummaries.length === 0 ? (
                  <p className="empty-state">Henüz konu özeti eklenmemiş.</p>
                ) : (
                  <div className="content-items">
                    {currentSummaries.map((summary) => (
                      <div key={summary.id} className="content-item">
                        <div className="content-item-info">
                          <h5>{summary.title}</h5>
                          <div className="content-item-meta">
                            <span>Sıra: {summary.order || 0}</span>
                            <span>İçerik: {summary.content?.substring(0, 100)}...</span>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => {
                              setEditingItem(summary);
                              setEditingType('summary');
                              setSummaryForm({
                                title: summary.title,
                                content: summary.content,
                                order: summary.order || 0,
                              });
                            }}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={async () => {
                              if (window.confirm(`"${summary.title}" özetini silmek istediğinize emin misiniz?`)) {
                                try {
                                  setProcessing(summary.id);
                                  const response = await examAPI.deleteSummary(summary.id);
                                  if (response.success) {
                                    setMessage({ type: 'success', text: 'Konu özeti başarıyla silindi.' });
                                    await loadCurrentContent();
                                  }
                                } catch (error) {
                                  setMessage({ type: 'error', text: error.message || 'Konu özeti silinirken bir hata oluştu.' });
                                } finally {
                                  setProcessing(null);
                                }
                              }
                            }}
                            disabled={processing === summary.id}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* Mevcut Konular Listesi */}
        {topics.length > 0 && (
          <div className="topics-list">
            <h3>Mevcut Konular ({topics.length})</h3>
            <div className="topics-grid">
              {topics.map((topic) => (
                <div key={topic.id} className="topic-card">
                  <div className="topic-card-header">
                    <div>
                      <h4>{topic.name}</h4>
                      <p>{topic.description || 'Açıklama yok'}</p>
                    </div>
                    <div className="topic-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => {
                          setEditingItem(topic);
                          setEditingType('topic');
                          setContentType(CONTENT_TYPES.TOPIC);
                          setTopicForm({
                            name: topic.name,
                            description: topic.description || '',
                            order: topic.order || 0,
                          });
                        }}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={async () => {
                          if (window.confirm(`"${topic.name}" konusunu silmek istediğinize emin misiniz?`)) {
                            try {
                              setProcessing(topic.id);
                              const response = await examAPI.deleteTopic(topic.id);
                              if (response.success) {
                                setMessage({ type: 'success', text: 'Konu başarıyla silindi.' });
                                await loadData();
                              }
                            } catch (error) {
                              setMessage({ type: 'error', text: error.message || 'Konu silinirken bir hata oluştu.' });
                            } finally {
                              setProcessing(null);
                            }
                          }
                        }}
                        disabled={processing === topic.id}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="topic-stats">
                    <span>📝 {topic._count?.questions || 0} Soru</span>
                    <span>📄 {topic._count?.articles || 0} Anlatım</span>
                    <span>📝 {topic._count?.summaries || 0} Özet</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminContentPage;
