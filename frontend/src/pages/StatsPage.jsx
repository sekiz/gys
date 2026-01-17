// Stats Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './StatsPage.css';

function StatsPage() {
  const [topicStats, setTopicStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const topicStatsResponse = await resultAPI.getAllTopicStats().catch(err => {
        console.error('Topic stats hatası:', err);
        return { success: false, error: err.message };
      });

      console.log('Topic Stats Response:', topicStatsResponse);

      if (topicStatsResponse.success) {
        const topics = topicStatsResponse.data.topicStats || [];
        console.log('Konu istatistikleri:', topics);
        console.log('Konu sayısı:', topics.length);
        setTopicStats(topics);
      } else {
        console.error('Topic stats başarısız:', topicStatsResponse);
        setTopicStats([]);
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      setTopicStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStats = async () => {
    if (window.confirm('Tüm istatistikleriniz silinecektir. Devam etmek istiyor musunuz?')) {
      try {
        await resultAPI.resetStats();
        await loadStats();
        alert('İstatistikler başarıyla sıfırlandı!');
      } catch (error) {
        console.error('İstatistik sıfırlama hatası:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="stats-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="stats-header">
          <h1>📊 Konu Bazlı Başarı İstatistiklerim</h1>
          <p className="stats-period">Tüm zamanlar için detaylı konu bazlı istatistikleriniz</p>
        </div>

        <div className="topic-stats-section">
          <h2>Konu Bazlı Detaylı İstatistikler</h2>
          {topicStats.length === 0 ? (
            <div className="empty-state">
              <p>📊 Henüz çözdüğünüz soru bulunmamaktadır.</p>
              <p className="empty-state-hint">
                Soruları çözmeye başladığınızda istatistikleriniz burada görünecektir.
              </p>
            </div>
          ) : (
            <div className="topic-stats-grid">
              {topicStats.map((topic) => (
                <div key={topic.id} className="topic-stat-card">
                  <h3>{topic.name}</h3>
                  <div className="topic-stat-details">
                    <div className="stat-detail">
                      <div className="stat-detail-value">{Number(topic.total)}</div>
                      <div className="stat-detail-label">Çözülen</div>
                    </div>
                    <div className="stat-detail">
                      <div className="stat-detail-value">{Number(topic.correct)}</div>
                      <div className="stat-detail-label">Doğru</div>
                    </div>
                    <div className="stat-detail">
                      <div className="stat-detail-value">{Number(topic.wrong)}</div>
                      <div className="stat-detail-label">Yanlış</div>
                    </div>
                  </div>
                  <div className="topic-progress-bar">
                    <div
                      className="topic-progress-fill"
                      style={{ width: `${topic.successRate || 0}%` }}
                    ></div>
                  </div>
                  <div className="topic-progress-text">Başarı Oranı: {Math.round(topic.successRate || 0)} puan</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="reset-stats-section">
          <button className="btn btn-danger" onClick={handleResetStats}>
            🔄 İstatistiklerimi Sıfırla
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default StatsPage;
