// Mixed Quiz Page Component
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionAPI, resultAPI, examAPI, packageAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MixedQuizPage.css';

// HTML entity'leri decode et
function decodeHtmlEntities(text) {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function MixedQuizPage() {
  const [questions, setQuestions] = useState([]);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState(new Set()); // Çözülen soru ID'lerini takip et
  // SessionStorage'dan stats'i yükle veya varsayılan değerleri kullan
  const [stats, setStats] = useState(() => {
    const savedStats = sessionStorage.getItem('mixedQuizStats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        return { total: 0, correct: 0, wrong: 0 };
      }
    }
    return { total: 0, correct: 0, wrong: 0 };
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();
  const limit = 10;
  
  // Filtreleme state'leri
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  
  // Tüm zamanların istatistikleri
  const [allTimeStats, setAllTimeStats] = useState({ total: 0, correct: 0, wrong: 0 });

  useEffect(() => {
    const initialize = async () => {
      await loadTopics();
      // İlk yüklemede tüm soruları yükle (filtre olmadan)
      await loadQuestions(true);
      // Tüm zamanların istatistiklerini yükle
      await loadAllTimeStats();
    };
    initialize();
  }, []);

  // Konular yüklendiğinde, eğer seçili konu yoksa tümünü seç
  useEffect(() => {
    if (topics.length > 0 && selectedTopics.length === 0) {
      const allTopicIds = topics.map(t => t.id);
      setSelectedTopics(allTopicIds);
    }
  }, [topics]);

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      setTopicsError(null);
      
      // Aktif paketi al
      const activePackageResponse = await packageAPI.getMyActivePackage();
      if (activePackageResponse.success && activePackageResponse.data.activePackage) {
        setHasActivePackage(true);
        const examId = activePackageResponse.data.activePackage.exam?.id;
        if (examId) {
          const topicsResponse = await examAPI.getTopics(examId);
          if (topicsResponse.success) {
            const topicsList = topicsResponse.data.topics || [];
            setTopics(topicsList);
            // İlk yüklemede tüm konuları seç
            if (topicsList.length > 0) {
              setSelectedTopics(topicsList.map(t => t.id));
            }
          } else {
            setTopicsError('Konular yüklenirken bir hata oluştu.');
          }
        } else {
          setTopicsError('Aktif paketinizde sınav bilgisi bulunamadı.');
        }
      } else {
        setHasActivePackage(false);
        setTopicsError('Aktif paketiniz bulunamadı. Lütfen önce bir paket satın alın.');
      }
    } catch (error) {
      console.error('Konular yüklenirken hata:', error);
      setHasActivePackage(false);
      setTopicsError('Konular yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadAllTimeStats = async () => {
    try {
      const response = await resultAPI.getAllTopicStats();
      if (response.success && response.data.topicStats) {
        // Tüm konulardaki istatistikleri topla
        const totalStats = response.data.topicStats.reduce(
          (acc, topic) => ({
            total: acc.total + (Number(topic.total) || 0),
            correct: acc.correct + (Number(topic.correct) || 0),
            wrong: acc.wrong + (Number(topic.wrong) || 0),
          }),
          { total: 0, correct: 0, wrong: 0 }
        );
        setAllTimeStats(totalStats);
      }
    } catch (error) {
      console.error('Tüm zamanlar istatistikleri yüklenirken hata:', error);
      // Hata durumunda sessizce devam et
    }
  };

  // Infinite scroll için scroll event listener (debounce ile)
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Sayfa sonuna yaklaşıldığında (100px kala)
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100
        ) {
          if (!loadingMore && hasMore && !loading) {
            loadMoreQuestions();
          }
        }
      }, 200); // 200ms debounce - gereksiz API çağrılarını önler
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadingMore, hasMore, loading]);

  const loadQuestions = useCallback(async (resetOffset = true) => {
    try {
      if (resetOffset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      // Offset'i state'ten al, resetOffset true ise 0 kullan
      const currentOffset = resetOffset ? 0 : offset;

      const params = {
        limit,
        offset: currentOffset,
      };

      // Seçili konular varsa ekle
      if (selectedTopics.length > 0) {
        // Eğer tüm konular seçiliyse topicIds gönderme (backend tümünü getirir)
        if (selectedTopics.length < topics.length) {
          params.topicIds = selectedTopics.join(',');
        }
        // Eğer hiç konu seçili değilse, tüm konuları seç (güvenlik için)
      } else if (topics.length > 0) {
        // Hiç konu seçili değilse, tüm konuları seç
        params.topicIds = topics.map(t => t.id).join(',');
      }

      const response = await questionAPI.getMixedQuestions(params);
      if (response.success) {
        // Backend zaten çözülmüş soruları exclude ediyor
        // Frontend'de sadece zaten listede olan soruları filtrele
        if (resetOffset) {
          setQuestions(response.data.questions);
          setOffset(response.data.questions.length);
        } else {
          setQuestions((prev) => {
            // Yeni soruları eklerken zaten listede olanları filtrele
            const newQuestions = response.data.questions.filter(
              (q) => !prev.some((pq) => pq.id === q.id)
            );
            return [...prev, ...newQuestions];
          });
          setOffset((prev) => prev + response.data.questions.length);
        }
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Soru yükleme hatası:', error);
    } finally {
      if (resetOffset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [offset, selectedTopics, topics, limit]);

  const loadMoreQuestions = async () => {
    if (loadingMore || !hasMore || loading) return;
    await loadQuestions(false);
  };

  const handleTopicToggle = (topicId) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        // Konuyu kaldır (en az bir konu zorunluluğu kaldırıldı)
        return prev.filter((id) => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === topics.length) {
      // Tümünü seçiliyse, sadece ilkini bırak
      setSelectedTopics([topics[0]?.id].filter(Boolean));
    } else {
      // Tümünü seç
      setSelectedTopics(topics.map((t) => t.id));
    }
  };

  const handleFilterApply = () => {
    loadQuestions(true);
    setShowFilters(false); // Filtreleri uyguladıktan sonra paneli kapat
  };

  const handleAnswer = async (questionId, isCorrect, userAnswer, question) => {
    try {
      // Question'dan topicId ve examId'yi al
      // Backend'den gelen format kontrolü
      console.log('Question objesi:', question);
      const topicId = question.topic?.id || question.topicId || null;
      const examId = question.topic?.exam?.id || question.examId || null;

      console.log('Kaydedilecek veriler:', { questionId, topicId, examId, isCorrect, userAnswer });

      const result = await resultAPI.saveResult({
        questionId,
        topicId,
        examId,
        isCorrect,
        userAnswer,
      });

      console.log('Sonuç kaydedildi:', result);

      // Çözülen soruyu takip et ve listeden kaldır
      setSolvedQuestionIds((prev) => new Set([...prev, questionId]));
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));

      setStats((prev) => {
        const newStats = {
          total: prev.total + 1,
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
        };
        // SessionStorage'a kaydet
        sessionStorage.setItem('mixedQuizStats', JSON.stringify(newStats));
        // Tüm zamanların istatistiklerini güncelle
        loadAllTimeStats();
        return newStats;
      });
    } catch (error) {
      console.error('Sonuç kaydetme hatası:', error);
      alert('Sonuç kaydedilirken bir hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  // Paket kontrolü - eğer aktif paket yoksa uyarı göster
  if (!hasActivePackage && !loadingTopics) {
    return (
      <div className="mixed-quiz-page">
        <Header />
        <div className="container">
          <button className="back-button" onClick={() => navigate('/anasayfa')}>
            ← Geri Dön
          </button>
          <div className="package-warning">
            <div className="warning-icon">⚠️</div>
            <h2>Paket Gerekli</h2>
            <p>İçeriğe erişmek için paket satın almalısınız.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/paketler')}
            >
              Paketleri Görüntüle →
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const successRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const allTimeSuccessRate = allTimeStats.total > 0 ? Math.round((allTimeStats.correct / allTimeStats.total) * 100) : 0;

  return (
    <div className="mixed-quiz-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="quiz-header">
          <div className="quiz-header-top">
            <h1>🎲 Karışık Soru Çözme</h1>
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕ Filtreleri Gizle' : '🔍 Filtrele'}
            </button>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-section">
                <div className="filter-section-header">
                  <label className="filter-label">
                    <strong>Konu Filtreleme:</strong>
                  </label>
                  <button
                    className="select-all-btn"
                    onClick={handleSelectAllTopics}
                    type="button"
                  >
                    {selectedTopics.length === topics.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>
                {loadingTopics ? (
                  <div className="loading-topics">Konular yükleniyor...</div>
                ) : topicsError ? (
                  <div className="topics-error" style={{ color: '#dc3545', padding: '1rem', textAlign: 'center' }}>
                    {topicsError}
                  </div>
                ) : topics.length === 0 ? (
                  <div className="topics-empty" style={{ color: '#666', padding: '1rem', textAlign: 'center' }}>
                    Henüz konu bulunmamaktadır.
                  </div>
                ) : (
                  <div className="topics-filter-grid">
                    {topics.map((topic) => (
                      <label key={topic.id} className="topic-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic.id)}
                          onChange={() => handleTopicToggle(topic.id)}
                        />
                        <span>{topic.name}</span>
                        {topic._count && (
                          <small>({topic._count.questions} soru)</small>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleFilterApply}
                >
                  Filtreleri Uygula
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedTopics(topics.map((t) => t.id));
                    loadQuestions(true);
                    setShowFilters(false); // Filtreleri sıfırladıktan sonra paneli kapat
                  }}
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="quiz-stats-bar sticky-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Toplam</div>
          </div>
          <div className="stat-item">
            <div className="stat-value correct-stat">{stats.correct}</div>
            <div className="stat-label">✓ Doğru</div>
          </div>
          <div className="stat-item">
            <div className="stat-value wrong-stat">{stats.wrong}</div>
            <div className="stat-label">✗ Yanlış</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{successRate} puan</div>
            <div className="stat-label">Başarı Puanı (Oturum)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{allTimeSuccessRate} puan</div>
            <div className="stat-label">Başarı Puanı (Tüm Zamanlar)</div>
          </div>
        </div>

        <div className="questions-container">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index + 1}
              onAnswer={(questionId, isCorrect, userAnswer) => 
                handleAnswer(questionId, isCorrect, userAnswer, question)
              }
            />
          ))}
          {loadingMore && (
            <div className="loading-more">
              <div className="spinner"></div>
              <p>Daha fazla soru yükleniyor...</p>
            </div>
          )}
          {!hasMore && questions.length > 0 && (
            <div className="no-more-questions">
              <p>🎉 Tüm soruları çözdünüz!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Question Card Component
function QuestionCard({ question, index, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  const handleOptionClick = (optionIndex) => {
    // Eğer soru zaten cevaplandıysa, hiçbir şey yapma
    if (answered) {
      return;
    }

    // Hemen answered state'ini true yap ki tekrar tıklanamasın
    setAnswered(true);
    setSelectedAnswer(optionIndex);
    
    const isCorrect = optionIndex === question.correctAnswer;
    onAnswer(question.id, isCorrect, optionIndex);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || reportReason.length < 10) {
      alert('Lütfen en az 10 karakterlik bir hata nedeni giriniz.');
      return;
    }

    try {
      setReporting(true);
      const response = await questionAPI.reportQuestion({
        questionId: question.id,
        reason: reportReason,
        description: reportDescription || null,
      });

      if (response.success) {
        alert('Hatalı soru bildirimi başarıyla gönderildi. Teşekkürler!');
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      }
    } catch (error) {
      alert('Bildirim gönderilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setReporting(false);
    }
  };

  return (
    <>
      <div className="question-card">
        <div className="question-header">
          <div className="question-header-top">
            <div className="question-header-left">
              <span className="question-number">Soru {index}</span>
              <span className="question-topic">📚 {question.topic_name || question.topic?.name}</span>
              {question.isPreviousExam && (
                <span className="previous-exam-badge" title="Çıkmış Soru">
                  📌 Çıkmış Soru
                </span>
              )}
            </div>
            <button
              className="report-question-btn"
              onClick={() => setShowReportModal(true)}
              title="Hatalı soru bildir"
            >
              ⚠️
            </button>
          </div>
        </div>
        <div className="question-text">{decodeHtmlEntities(question.question)}</div>
        <div className="options-list">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`option-item ${
                answered && idx === question.correctAnswer ? 'correct' : ''
              } ${
                answered && selectedAnswer === idx && idx !== question.correctAnswer
                  ? 'incorrect'
                  : ''
              } ${selectedAnswer === idx ? 'selected' : ''} ${answered ? 'disabled' : ''}`}
              onClick={() => handleOptionClick(idx)}
              style={answered ? { pointerEvents: 'none', cursor: 'default' } : {}}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{decodeHtmlEntities(option)}</span>
            </div>
          ))}
        </div>
        {question.explanation && answered && (
          <button className="solution-btn" onClick={() => setShowSolution(!showSolution)}>
            💡 {showSolution ? 'Çözümü Gizle' : 'Çözüm'}
          </button>
        )}
        {showSolution && question.explanation && answered && (
          <div className="solution-text">{decodeHtmlEntities(question.explanation)}</div>
        )}
      </div>

      {/* Hatalı Soru Bildirim Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Hatalı Soru Bildir</h2>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>
                  Hata Nedeni <span className="required">*</span>
                  <small>(En az 10 karakter)</small>
                </label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Örn: Sorunun doğru cevabı yanlış işaretlenmiş, seçeneklerde yazım hatası var..."
                  required
                  minLength={10}
                />
              </div>
              <div className="form-group">
                <label>
                  Açıklama <small>(Opsiyonel)</small>
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Ek bilgi veya açıklama ekleyebilirsiniz..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reporting || !reportReason.trim() || reportReason.length < 10}
                >
                  {reporting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MixedQuizPage;
