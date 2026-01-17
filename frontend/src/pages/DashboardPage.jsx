// Dashboard Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, resultAPI, packageAPI, rankingAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DashboardPage.css';

function DashboardPage() {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [siteAverage, setSiteAverage] = useState(null);
  const [myPackages, setMyPackages] = useState([]);
  const [topics, setTopics] = useState([]); // İlk paketin konuları varsayılan
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsResponse, statsResponse, packagesResponse] = await Promise.all([
        examAPI.getExams(),
        resultAPI.getStats(),
        packageAPI.getMyPackages().catch(() => ({ success: false, data: { userPackages: [] } })),
      ]);

      if (examsResponse.success) {
        // Dashboard'da sadece aktif sınavları göster
        const activeExams = examsResponse.data.exams.filter(exam => exam.isActive === true);
        setExams(activeExams);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
      }

      if (packagesResponse.success && packagesResponse.data.userPackages) {
        // Sadece ACTIVE olanları filtrele
        const actives = packagesResponse.data.userPackages.filter(p => p.status === 'ACTIVE');
        setMyPackages(actives);

        // İlk aktif paketin konularını yükle (Varsayılan olarak)
        if (actives.length > 0 && actives[0].exam?.id) {
          try {
            const topicsResponse = await examAPI.getTopics(actives[0].exam.id);
            if (topicsResponse.success) {
              setTopics(topicsResponse.data.topics || []);
            }
          } catch (error) {
            console.error('Konular yüklenirken hata:', error);
          }
        }
      }

      // Tüm zamanlar istatistiklerini ve site ortalamasını yükle
      await loadAllTimeStats();
      await loadSiteAverage();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const loadSiteAverage = async () => {
    try {
      const response = await rankingAPI.getSiteAverage();
      if (response.success) {
        setSiteAverage(response.data);
      }
    } catch (error) {
      console.error('Site ortalaması yüklenirken hata:', error);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-page">
      <Header />
      <div className="container">
        <div className="dashboard-layout">
          {/* Sol Taraf */}
          <div className="dashboard-left">
            {/* Hoş Geldiniz */}
            <div className="welcome-section">
              <h1>Hoş geldiniz,</h1>
              <h2>{user?.name}!</h2>
            </div>

            {/* İstatistikler */}
            {stats && (
              <div className="stats-section">
                <div className="stats-card">
                  <div className="stats-header">
                    <h3>📊 Başarı İstatistiklerim</h3>
                  </div>

                  {/* İstatistikler - Tek Satır Formatında */}
                  <div className="stats-rows">
                    <div className="stats-row">
                      <div className="stats-row-label">Bugün Çözülen Soru:</div>
                      <div className="stats-row-value">{stats.total}</div>
                    </div>
                    <div className="stats-row">
                      <div className="stats-row-label">Doğru:</div>
                      <div className="stats-row-value correct-stat">{stats.correct}</div>
                    </div>
                    <div className="stats-row">
                      <div className="stats-row-label">Yanlış:</div>
                      <div className="stats-row-value wrong-stat">{stats.wrong}</div>
                    </div>
                    <div className="stats-row">
                      <div className="stats-row-label">Bugünkü Puanım:</div>
                      <div className="stats-row-value">{Math.round(stats.successRate)} puan</div>
                    </div>
                    {allTimeStats && allTimeStats.total > 0 && (
                      <div className="stats-row">
                        <div className="stats-row-label">Tüm Zamanlardaki Puan:</div>
                        <div className="stats-row-value">
                          {Math.round((allTimeStats.correct / allTimeStats.total) * 100)} puan
                        </div>
                      </div>
                    )}
                    {siteAverage && siteAverage.averageScore !== null && (
                      <div className="stats-row">
                        <div className="stats-row-label">Site Ortalaması:</div>
                        <div className="stats-row-value">
                          {siteAverage.averageScore} puan
                          <span className="stats-row-note">({siteAverage.totalUsers} kullanıcı)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="stats-footer">
                    <button
                      className="btn btn-link btn-all-time"
                      onClick={() => navigate('/istatistikler')}
                    >
                      Detaylı İstatistikler →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aktif Paketler */}
            <div className="package-section">
              {myPackages.length > 0 ? (
                <div className="packages-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {myPackages.map(pkg => (
                    <div key={pkg.id} className="active-package-card">
                      <div className="package-header">
                        <span className="package-badge">✅ Aktif Paket</span>
                      </div>
                      <h3>{pkg.exam.name}</h3>
                      {pkg.expiresAt && (
                        <p className="package-expiry">
                          Bitiş: {new Date(pkg.expiresAt).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => navigate(`/sinav/${pkg.exam.id}`)}
                      >
                        Pakete Git →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-package-card">
                  <div className="package-header">
                    <span className="package-badge warning">⚠️ Aktif Paket Yok</span>
                  </div>
                  <p>İçeriklere erişmek için bir paket satın almanız gerekmektedir.</p>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => navigate('/paketler')}
                  >
                    Paket Satın Al →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Taraf */}
          <div className="dashboard-right">
            {/* Karışık Soru Çöz ve Deneme Sınavları Butonları */}
            <div className="quick-action-section">
              <div className="quick-action-card">
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => navigate('/quiz/karisik')}
                >
                  🎲 Karışık Soru Çöz
                </button>
              </div>
              <div className="quick-action-card">
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => navigate('/deneme-sinavlari')}
                  style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                >
                  📝 Deneme Sınavları
                </button>
              </div>
            </div>

            {/* Çalışmaya Başla */}
            <div className="exams-section">
              <h2 className="exams-title">🚀 Çalışmaya Başla</h2>
              <p className="exams-subtitle">Aşağıdaki sınavlardan birine tıklayarak çalışmaya başlayabilirsiniz</p>
              <div className="exams-list">
                {exams.length === 0 ? (
                  <div className="no-exams">
                    <p>Henüz sınav bulunmamaktadır.</p>
                  </div>
                ) : (
                  exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="exam-card-horizontal"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      <div className="exam-card-content">
                        <div className="exam-card-main">
                          <h3>{exam.name}</h3>
                          <p>{exam.description}</p>
                        </div>
                        <div className="exam-card-stats">
                          <span>📚 {exam._count?.topics || 0} Konu</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sorumlu Olunan Konular (Varsayılan: Son Paket) */}
            {myPackages.length > 0 && topics.length > 0 && (
              <div className="topics-accordion">
                <div
                  className="topics-accordion-header"
                  onClick={() => setTopicsExpanded(!topicsExpanded)}
                >
                  <h3>📚 Sorumlu Olunan Konular</h3>
                  <span className="accordion-icon">{topicsExpanded ? '▼' : '▶'}</span>
                </div>
                {topicsExpanded && (
                  <div className="topics-accordion-content">
                    <div className="topics-list">
                      {topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="topic-item"
                          onClick={() => navigate(`/topic/${topic.id}`)}
                        >
                          <div className="topic-item-info">
                            <h4>{topic.name}</h4>
                            {topic.description && (
                              <p>{topic.description}</p>
                            )}
                          </div>
                          <div className="topic-item-stats">
                            <span>📝 {topic._count?.questions || 0} Soru</span>
                            <span>📄 {topic._count?.articles || 0} Madde</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;
