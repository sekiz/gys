// Practice Exam Result Page - Deneme Sınavı Sonuç Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PracticeExamResultPage.css';

function PracticeExamResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    } else {
      // Eğer state yoksa listeye yönlendir
      navigate('/deneme-sinavlari');
    }
  }, [location, navigate]);

  if (!result) {
    return (
      <div className="practice-exam-result-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const percentage = parseFloat(result.percentage);
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
    <div className="practice-exam-result-page">
      <Header />
      <div className="container">
        <div className="result-container">
          <div className="result-header">
            <h1>📊 Sınav Sonucu</h1>
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

          <div className="result-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/deneme-sinavlari')}
            >
              Deneme Sınavlarına Dön
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/anasayfa')}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PracticeExamResultPage;
