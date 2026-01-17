// Practice Exam Page - Deneme Sınavı Çözme Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { practiceExamAPI, packageAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PracticeExamPage.css';

// HTML entity'leri decode et
function decodeHtmlEntities(text) {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function PracticeExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [practiceExam, setPracticeExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0); // saniye cinsinden
  const [examStarted, setExamStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  const [checkingPackage, setCheckingPackage] = useState(true);

  useEffect(() => {
    checkActivePackage();
  }, []);

  useEffect(() => {
    if (hasActivePackage) {
      loadPracticeExam();
    }
  }, [id, hasActivePackage]);

  const checkActivePackage = async () => {
    try {
      setCheckingPackage(true);
      const response = await packageAPI.getMyActivePackage();
      if (response.success && response.data.activePackage) {
        setHasActivePackage(true);
      } else {
        setHasActivePackage(false);
      }
    } catch (error) {
      console.error('Paket kontrolü hatası:', error);
      setHasActivePackage(false);
    } finally {
      setCheckingPackage(false);
    }
  };

  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Süre doldu, otomatik gönder
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted, timeRemaining]);

  const loadPracticeExam = async () => {
    try {
      setLoading(true);
      const response = await practiceExamAPI.getPracticeExam(id);
      if (response.success) {
        const exam = response.data.practiceExam;
        setPracticeExam(exam);
        setQuestions(exam.questions.map((tq) => tq.question));
        setTimeRemaining(exam.duration * 60); // dakikayı saniyeye çevir
      }
    } catch (error) {
      console.error('Deneme sınavı yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    
    // Mobilde şık seçildiğinde navigation butonlarına scroll yap
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const navElement = document.querySelector('.question-navigation');
        if (navElement) {
          navElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    // Tüm sorular cevaplandı mı kontrol et
    const unansweredCount = questions.filter(
      (q) => answers[q.id] === undefined
    ).length;

    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `${unansweredCount} soru cevaplanmamış. Yine de sınavı bitirmek istiyor musunuz?`
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      const timeSpent = practiceExam.duration * 60 - timeRemaining;

      const response = await practiceExamAPI.submitPracticeExam(id, {
        answers,
        timeSpent,
        startedAt: startTime,
      });

      if (response.success) {
        navigate(`/deneme-sinavi/${id}/sonuc`, {
          state: { result: response.data.result },
        });
      }
    } catch (error) {
      console.error('Sınav gönderilirken hata:', error);
      alert('Sınav gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
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

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  if (checkingPackage || loading) {
    return (
      <div className="practice-exam-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Paket kontrolü - eğer aktif paket yoksa uyarı göster
  if (!hasActivePackage) {
    return (
      <div className="practice-exam-page">
        <Header />
        <div className="container">
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

  if (!practiceExam) {
    return (
      <div className="practice-exam-page">
        <Header />
        <div className="container">
          <div className="error-state">
            <h2>Deneme sınavı bulunamadı</h2>
            <button className="btn btn-primary" onClick={() => navigate('/deneme-sinavlari')}>
              Geri Dön
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="practice-exam-page">
        <Header />
        <div className="container">
          <div className="exam-start-screen">
            <div className="start-card">
              <h1>{practiceExam.title}</h1>
              {practiceExam.description && (
                <p className="exam-description">{practiceExam.description}</p>
              )}
              <div className="exam-info">
                <div className="info-item">
                  <span className="info-label">Sınav:</span>
                  <span className="info-value">{practiceExam.exam.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Süre:</span>
                  <span className="info-value">{practiceExam.duration} dakika</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Soru Sayısı:</span>
                  <span className="info-value">{questions.length} soru</span>
                </div>
              </div>
              <div className="start-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/deneme-sinavlari')}>
                  Geri Dön
                </button>
                <button className="btn btn-primary btn-large" onClick={handleStartExam}>
                  Sınava Başla
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="practice-exam-page">
      <Header />
      <div className="container">
        {/* Timer ve Progress Bar */}
        <div className="exam-header">
          <div className="timer-section">
            <div className={`timer ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
            <div className="progress-info">
              {answeredCount} / {questions.length} soru cevaplandı
            </div>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Soru Kartı */}
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="question-card">
            <h3 className="question-text">{decodeHtmlEntities(currentQuestion.question)}</h3>
            <div className="options-list">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${
                    answers[currentQuestion.id] === index ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerChange(currentQuestion.id, index)}
                >
                  <div className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="option-text">{decodeHtmlEntities(option)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="question-navigation">
            <button
              className="btn btn-secondary"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Önceki
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                className="btn btn-primary btn-finish"
                onClick={handleSubmitExam}
                disabled={submitting}
              >
                {submitting ? 'Gönderiliyor...' : '✅ Sınavı Bitir'}
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={handleNextQuestion}
              >
                Sonraki →
              </button>
            )}
          </div>

          {/* Soru Listesi (Mini Navigation) */}
          <div className="questions-mini-nav">
            <h4>Sorular:</h4>
            <div className="questions-grid">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-number-btn ${
                    index === currentQuestionIndex ? 'active' : ''
                  } ${answers[q.id] !== undefined ? 'answered' : ''}`}
                  onClick={() => handleQuestionClick(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button - Tüm sorular cevaplandığında göster */}
          {allAnswered && currentQuestionIndex !== questions.length - 1 && (
            <div className="submit-section">
              <button
                className="btn btn-primary btn-large btn-submit"
                onClick={handleSubmitExam}
                disabled={submitting}
              >
                {submitting ? 'Gönderiliyor...' : '✅ Sınavı Bitir'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PracticeExamPage;
