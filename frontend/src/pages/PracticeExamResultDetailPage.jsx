// Practice Exam Result Detail Page - Deneme Sınavı Sonuç Detay Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { practiceExamAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PracticeExamResultDetailPage.css';

// HTML entity'leri decode et
function decodeHtmlEntities(text) {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function PracticeExamResultDetailPage() {
  const navigate = useNavigate();
  const { resultId } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResultDetail();
  }, [resultId]);

  const loadResultDetail = async () => {
    try {
      setLoading(true);
      const response = await practiceExamAPI.getPracticeExamResultDetail(resultId);
      if (response.success) {
        setResult(response.data.result);
      } else {
        alert('Sonuç yüklenirken bir hata oluştu.');
        navigate('/deneme-sinavlari');
      }
    } catch (error) {
      console.error('Sonuç detay yükleme hatası:', error);
      alert('Sonuç yüklenirken bir hata oluştu.');
      navigate('/deneme-sinavlari');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="practice-exam-result-detail-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="practice-exam-result-detail-page">
        <Header />
        <div className="container">
          <div className="error-message">Sonuç bulunamadı.</div>
        </div>
        <Footer />
      </div>
    );
  }

  const percentage = parseFloat(result.percentage);
  const answers = result.answers || {};
  const questions = result.test.questions || [];

  const getScoreColor = () => {
    if (percentage >= 70) return '#28a745';
    if (percentage >= 50) return '#ffc107';
    return '#dc3545';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="practice-exam-result-detail-page">
      <Header />
      <div className="container">
        <div className="result-detail-container">
          {/* Sonuç Özeti */}
          <div className="result-summary">
            <div className="summary-header">
              <h1>📊 Sınav Sonucu Detayları</h1>
              <p className="exam-title">{result.test.title}</p>
            </div>

            <div className="score-card" style={{ borderColor: getScoreColor() }}>
              <div className="score-circle" style={{ borderColor: getScoreColor() }}>
                <div className="score-value" style={{ color: getScoreColor() }}>
                  {Math.round(percentage)} puan
                </div>
              </div>
              <div className="score-details">
                <div className="score-item">
                  <span className="score-label">Doğru:</span>
                  <span className="score-number correct">{result.score}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Yanlış:</span>
                  <span className="score-number wrong">{result.total - result.score}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Toplam:</span>
                  <span className="score-number">{result.total}</span>
                </div>
              </div>
            </div>

            <div className="result-info">
              <div className="info-card">
                <div className="info-icon">⏱️</div>
                <div className="info-content">
                  <div className="info-label">Kullanılan Süre</div>
                  <div className="info-value">{formatTime(result.timeSpent)}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <div className="info-label">Tamamlanma Tarihi</div>
                  <div className="info-value">
                    {new Date(result.completedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sorular Listesi */}
          <div className="questions-review">
            <h2>📝 Sorular ve Cevaplarınız</h2>
            <div className="questions-list">
              {questions.map((testQuestion, index) => {
                const question = testQuestion.question;
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer;
                const isAnswered = userAnswer !== undefined;

                return (
                  <div
                    key={question.id}
                    className={`question-review-card ${isCorrect ? 'correct' : isAnswered ? 'incorrect' : 'unanswered'}`}
                  >
                    <div className="question-review-header">
                      <span className="question-number">Soru {index + 1}</span>
                      {question.topic && (
                        <span className="question-topic">📚 {question.topic.name}</span>
                      )}
                      <span className={`answer-status ${isCorrect ? 'correct' : isAnswered ? 'incorrect' : 'unanswered'}`}>
                        {isCorrect ? '✅ Doğru' : isAnswered ? '❌ Yanlış' : '⭕ Cevaplanmadı'}
                      </span>
                    </div>
                    <div className="question-review-text">
                      {decodeHtmlEntities(question.question)}
                    </div>
                    <div className="question-review-options">
                      {question.options.map((option, idx) => {
                        const isUserAnswer = userAnswer === idx;
                        const isCorrectAnswer = idx === question.correctAnswer;
                        let optionClass = 'option-review';
                        if (isCorrectAnswer) {
                          optionClass += ' correct-answer';
                        }
                        if (isUserAnswer && !isCorrectAnswer) {
                          optionClass += ' wrong-answer';
                        }
                        if (isUserAnswer && isCorrectAnswer) {
                          optionClass += ' user-correct';
                        }

                        return (
                          <div key={idx} className={optionClass}>
                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                            <span className="option-text">{decodeHtmlEntities(option)}</span>
                            {isCorrectAnswer && <span className="correct-badge">✓ Doğru Cevap</span>}
                            {isUserAnswer && !isCorrectAnswer && <span className="wrong-badge">✗ Sizin Cevabınız</span>}
                            {isUserAnswer && isCorrectAnswer && <span className="correct-badge">✓ Doğru Cevabınız</span>}
                          </div>
                        );
                      })}
                    </div>
                    {question.explanation && (
                      <div className="question-explanation">
                        <strong>💡 Açıklama:</strong>
                        <p>{decodeHtmlEntities(question.explanation)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="result-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/deneme-sinavlari')}
            >
              Deneme Sınavlarına Dön
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/deneme-sinavi/${result.test.id}`)}
            >
              🔄 Tekrar Çöz
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PracticeExamResultDetailPage;
