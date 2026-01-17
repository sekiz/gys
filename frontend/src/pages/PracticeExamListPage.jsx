// Practice Exam List Page - Deneme Sınavları Listesi
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { practiceExamAPI, packageAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PracticeExamListPage.css';

function PracticeExamListPage() {
  const [practiceExams, setPracticeExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  const [checkingPackage, setCheckingPackage] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkActivePackage();
  }, []);

  useEffect(() => {
    if (hasActivePackage) {
      loadPracticeExams();
    }
  }, [hasActivePackage]);

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

  const loadPracticeExams = async () => {
    try {
      setLoading(true);
      const response = await practiceExamAPI.getPracticeExams();
      if (response.success) {
        setPracticeExams(response.data.practiceExams);
      }
    } catch (error) {
      console.error('Deneme sınavları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/deneme-sinavi/${examId}`);
  };

  if (checkingPackage || loading) {
    return (
      <div className="practice-exam-list-page">
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
      <div className="practice-exam-list-page">
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

  return (
    <div className="practice-exam-list-page">
      <Header />
      <div className="container">
        <div className="page-header">
          <h2>📝 Deneme Sınavları</h2>
        </div>

        {practiceExams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>Henüz deneme sınavı bulunmamaktadır</h2>
            <p>Yakında yeni deneme sınavları eklenecektir.</p>
          </div>
        ) : (
          <div className="practice-exams-horizontal">
            {practiceExams.map((exam) => {
              const hasResult = exam.lastResult !== null;
              return (
                <div key={exam.id} className="practice-exam-card">
                  <div className="exam-card-header">
                    <h3>{exam.title}</h3>
                    <span className="exam-badge">{exam.exam.name}</span>
                  </div>
                  {exam.description && (
                    <p className="exam-description">{exam.description}</p>
                  )}
                  <div className="exam-meta">
                    <span className="meta-item">
                      ⏱️ {exam.duration} dakika
                    </span>
                    <span className="meta-item">
                      📝 {exam._count?.questions || exam.questionCount} soru
                    </span>
                  </div>
                  {hasResult && (
                    <div className="exam-result">
                      <div className="result-label">Son Puan:</div>
                      <div className="result-score">
                        {Math.round(exam.lastResult.percentage)} puan
                      </div>
                    </div>
                  )}
                  <div className="exam-actions">
                    {hasResult && (
                      <button
                        className="btn btn-info btn-view-result"
                        onClick={() => navigate(`/deneme-sinavi-sonuc/${exam.lastResult.id}`)}
                      >
                        📊 Sonuçları Görüntüle
                      </button>
                    )}
                    <button
                      className={`btn ${hasResult ? 'btn-secondary' : 'btn-primary'} btn-start`}
                      onClick={() => handleStartExam(exam.id)}
                    >
                      {hasResult ? '🔄 Tekrar Çöz' : 'Sınava Başla →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default PracticeExamListPage;
