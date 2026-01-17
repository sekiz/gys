// Topic Detail Page Component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, questionAPI, resultAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TopicDetailPage.css';

// HTML entity'leri decode et
function decodeHtmlEntities(text) {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(true);

  // Soruları tipine göre ayır
  const multipleChoiceQuestions = questions.filter(q => q.type === 'MULTIPLE_CHOICE');
  const trueFalseQuestions = questions.filter(q => q.type === 'TRUE_FALSE');

  useEffect(() => {
    const loadTopicData = async () => {
      try {
        const [topicResponse, articlesResponse, summariesResponse, questionsResponse] = await Promise.all([
          examAPI.getTopic(id),
          examAPI.getArticles(id),
          examAPI.getSummaries(id),
          questionAPI.getQuestions({ topicId: id }),
        ]);

        if (topicResponse.success) {
          setTopic(topicResponse.data.topic);
        }

        if (articlesResponse.success) {
          setArticles(articlesResponse.data.articles);
        }

        if (summariesResponse.success) {
          setSummaries(summariesResponse.data.summaries);
        }

        if (questionsResponse.success) {
          setQuestions(questionsResponse.data.questions);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopicData();
  }, [id]);

  const handleAnswer = async (questionId, isCorrect, userAnswer) => {
    try {
      await resultAPI.saveResult({
        questionId,
        topicId: id,
        isCorrect,
        userAnswer,
      });
    } catch (error) {
      console.error('Sonuç kaydetme hatası:', error);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!topic) {
    return <div className="error">Konu bulunamadı</div>;
  }

  return (
    <div className="topic-detail-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="topic-header">
          <h1>{topic.name}</h1>
          <p>{topic.description}</p>
        </div>

        <div className="topic-tabs">
          <button
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📄 Konu Anlatımı
            {articles.length > 0 && <span className="tab-badge">{articles.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'summaries' ? 'active' : ''}`}
            onClick={() => setActiveTab('summaries')}
          >
            💡 Konu Özeti
            {summaries.length > 0 && <span className="tab-badge">{summaries.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'multiple-choice' ? 'active' : ''}`}
            onClick={() => setActiveTab('multiple-choice')}
          >
            ✅ Çoktan Seçmeli Sorular
            {multipleChoiceQuestions.length > 0 && <span className="tab-badge">{multipleChoiceQuestions.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'true-false' ? 'active' : ''}`}
            onClick={() => setActiveTab('true-false')}
          >
            ✓✗ Doğru/Yanlış Sorular
            {trueFalseQuestions.length > 0 && <span className="tab-badge">{trueFalseQuestions.length}</span>}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'articles' && (
            <div className="articles-list">
              {articles.length === 0 ? (
                <div className="empty-state">
                  <p>📄 Bu konuda henüz konu anlatımı bulunmamaktadır.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <div key={article.id} className="article-card">
                    <h3>{article.title}</h3>
                    <p>{article.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'summaries' && (
            <div className="summaries-list">
              {summaries.length === 0 ? (
                <div className="empty-state">
                  <p>💡 Bu konuda henüz konu özeti bulunmamaktadır.</p>
                </div>
              ) : (
                summaries.map((summary) => (
                  <div key={summary.id} className="summary-card">
                    <h3>{summary.title}</h3>
                    <p>{summary.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'multiple-choice' && (
            <div className="questions-list">
              {multipleChoiceQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>📝 Bu konuda henüz çoktan seçmeli soru bulunmamaktadır.</p>
                </div>
              ) : (
                multipleChoiceQuestions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index + 1}
                    onAnswer={handleAnswer}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'true-false' && (
            <div className="questions-list">
              {trueFalseQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>✓✗ Bu konuda henüz doğru/yanlış soru bulunmamaktadır.</p>
                </div>
              ) : (
                trueFalseQuestions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index + 1}
                    onAnswer={handleAnswer}
                  />
                ))
              )}
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
    if (answered) return;

    setSelectedAnswer(optionIndex);
    setAnswered(true);
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
            <span className="question-number">Soru {index}</span>
            <button
              className="report-question-btn"
              onClick={() => setShowReportModal(true)}
              title="Hatalı soru bildir"
            >
              ⚠️
            </button>
          </div>
          {question.isPreviousExam && (
            <div className="question-header-meta">
              <span className="previous-exam-badge" title="Çıkmış Soru">
                📌 Çıkmış Soru
              </span>
            </div>
          )}
        </div>
        <div className="question-text">{decodeHtmlEntities(question.question)}</div>
        <div className="options-list">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`option-item ${answered && idx === question.correctAnswer ? 'correct' : ''
                } ${answered && selectedAnswer === idx && idx !== question.correctAnswer
                  ? 'incorrect'
                  : ''
                } ${selectedAnswer === idx ? 'selected' : ''}`}
              onClick={() => handleOptionClick(idx)}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{decodeHtmlEntities(option)}</span>
            </div>
          ))}
        </div>
        {question.explanation && (
          <button className="solution-btn" onClick={() => setShowSolution(!showSolution)}>
            💡 {showSolution ? 'Çözümü Gizle' : 'Çözüm'}
          </button>
        )}
        {showSolution && question.explanation && (
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

export default TopicDetailPage;
