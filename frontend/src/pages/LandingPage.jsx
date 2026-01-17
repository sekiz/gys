// Landing Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI } from '../services/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

import HeroSlider from '../components/HeroSlider';
import InstitutionGrid from '../components/InstitutionGrid';
import ExamGrid from '../components/ExamGrid';
import FeaturedExams from '../components/FeaturedExams';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await examAPI.getPublicExams();
      if (response.success) {
        setExams(response.data.exams);
      }
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/anasayfa');
    } else {
      navigate('/kayit');
    }
  };

  return (
    <div className="landing-page">
      <Header />

      <main>
        {/* New Carousel Hero Section */}
        <HeroSlider />

        {/* Institution / Categories Grid */}
        <InstitutionGrid />

        {/* Exam List Section - Reverted as per user request */}
        {exams.length > 0 && (
          <section className="px-4 md:px-10 pb-12 bg-gray-50 pt-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hazırlanabileceğiniz Sınavlar</h2>
                <span className="text-sm text-gray-500">Güncel listeler</span>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition"
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate(`/sinav/${exam.id}`);
                        } else {
                          navigate('/kayit');
                        }
                      }}
                    >
                      <figure className="h-40 bg-base-200">
                        {exam.imageUrl ? (
                          <img src={exam.imageUrl} alt={exam.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">📚</div>
                        )}
                      </figure>
                      <div className="card-body">
                        <div className="flex justify-between items-start">
                          <h3 className="card-title text-xl">{exam.name}</h3>
                          <div className="badge badge-lg">{exam.institution || 'Genel'}</div>
                        </div>
                        <p className="text-sm text-base-content/70 line-clamp-2 mt-2">
                          {exam.description || 'Kamu sınavlarına hazırlık için kapsamlı içerik'}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <span className="badge badge-ghost text-xs">📚 {exam._count?.topics || 0} Konu</span>
                            {exam.questionCount > 0 && <span className="badge badge-info text-xs text-white">❓ {exam.questionCount} Soru</span>}
                          </div>
                          <span className="text-primary font-bold text-lg">
                            {exam.price ? `₺${exam.price}` : 'Ücretsiz'}
                          </span>
                        </div>
                        <button className="btn btn-primary btn-sm btn-block mt-4">
                          İncele
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="px-4 md:px-10 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Platform Özellikleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-3xl">📚</div>
                  <h3 className="card-title">Kapsamlı Soru Bankası</h3>
                  <p className="text-sm text-base-content/70">
                    Tüm konuları kapsayan binlerce güncel soru ile kendinizi test edin.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-3xl">📊</div>
                  <h3 className="card-title">Detaylı Analizler</h3>
                  <p className="text-sm text-base-content/70">
                    Güçlü ve zayıf yönlerinizi keşfedin, hedefli çalışın.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-3xl">🎯</div>
                  <h3 className="card-title">Konu Bazlı Çalışma</h3>
                  <p className="text-sm text-base-content/70">
                    İstediğiniz konuyu seçin, odaklanarak çalışın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
