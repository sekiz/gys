// Ranking Page - Kullanıcı Sıralaması
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rankingAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './RankingPage.css';

function RankingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const response = await rankingAPI.getRankings();
      if (response.success) {
        setRankings(response.data.rankings || []);
      }
    } catch (error) {
      console.error('Sıralama yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcının kendi sıralamasını bul
  const userRanking = user ? rankings.findIndex((r) => r.userId === user.id) : -1;
  const userRank = userRanking >= 0 ? rankings[userRanking] : null;

  if (loading) {
    return (
      <div className="ranking-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="ranking-header">
          <h1>🏆 Kullanıcı Sıralaması</h1>
          <p className="ranking-description">
            Tüm kullanıcıların başarı puanlarına göre sıralaması
          </p>
        </div>

        {/* Kullanıcının kendi sıralaması */}
        {userRank && (
          <div className="user-ranking-card">
            <h2>📊 Sizin Sıralamanız</h2>
            <div className="user-ranking-info">
              <div className="rank-badge-large">#{userRank.rank}</div>
              <div className="user-ranking-details">
                <div className="user-ranking-name">{userRank.name}</div>
                <div className="user-ranking-stats">
                  <span>📝 {userRank.total} soru</span>
                  <span>✓ {userRank.correct} doğru</span>
                  <span>✗ {userRank.wrong} yanlış</span>
                  <span>🏆 {userRank.score} puan</span>
                  {userRank.city && userRank.city !== '-' && (
                    <span>📍 {userRank.city}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sıralama Tablosu */}
        <div className="ranking-table-container">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Kullanıcı Adı</th>
                <th>Sınav Türü</th>
                <th>Çözülen</th>
                <th>Doğru</th>
                <th>Yanlış</th>
                <th>Puan</th>
                <th>Şehir</th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-message">
                    Henüz sıralama verisi bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                rankings.map((ranking, index) => {
                  const isCurrentUser = user && ranking.userId === user.id;
                  return (
                    <tr key={ranking.userId} className={isCurrentUser ? 'current-user' : ''}>
                      <td className="rank-cell">
                        {index < 3 ? (
                          <span className={`rank-badge rank-${index + 1}`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="rank-number">#{ranking.rank}</span>
                        )}
                      </td>
                      <td className="name-cell">{ranking.name}</td>
                      <td className="exam-cell">{ranking.examName}</td>
                      <td className="stat-cell">{ranking.total}</td>
                      <td className="stat-cell correct-stat">{ranking.correct}</td>
                      <td className="stat-cell wrong-stat">{ranking.wrong}</td>
                      <td className="score-cell">
                        <span className="score-value">{ranking.score}</span>
                        <span className="score-label">puan</span>
                      </td>
                      <td className="city-cell">{ranking.city}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RankingPage;
