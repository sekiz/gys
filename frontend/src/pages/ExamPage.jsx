// Exam Page Component - Sınav detayı ve konular
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ExamPage.css';

function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamData();
  }, [id]);

  const loadExamData = async () => {
    try {
      const [examResponse, topicsResponse] = await Promise.all([
        examAPI.getExam(id),
        examAPI.getTopics(id),
      ]);

      if (examResponse.success) {
        setExam(examResponse.data.exam);
      }

      if (topicsResponse.success) {
        setTopics(topicsResponse.data.topics);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!exam) {
    return <div className="error">Sınav bulunamadı</div>;
  }

  return (
    <div className="exam-page">
      <Header />
      <div className="container">
        <button className="back-button" onClick={() => navigate('/anasayfa')}>
          ← Geri Dön
        </button>

        <div className="exam-header">
          <h1>{exam.name}</h1>
          <p>{exam.description}</p>
        </div>

        <div className="topics-section">
          <h2>📚 Konular</h2>
          <div className="topics-grid">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="topic-card"
                onClick={() => navigate(`/topic/${topic.id}`)}
              >
                <h3>{topic.name}</h3>
                <p>{topic.description}</p>
                <div className="topic-stats">
                  <span>📝 {topic._count?.questions || 0} Soru</span>
                  <span>📄 {topic._count?.articles || 0} Madde</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default ExamPage;
