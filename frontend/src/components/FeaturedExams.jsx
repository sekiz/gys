import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaUserFriends, FaSignal, FaClock } from 'react-icons/fa';
import './FeaturedExams.css';

function FeaturedExams({ exams, loading }) {
    const navigate = useNavigate();

    if (loading) {
        return null; // Or skeleton
    }

    // Display maybe another slice or sorted differently
    const featureList = exams.slice(0, 6);

    return (
        <div className="featured-exams-container">
            <div className="featured-header">
                <h2>Güncel Sınavlar</h2>
                <p className="text-gray-500 text-sm mt-1">Özenle hazırlanan içeriklerimizle sınavlara hazırlan.</p>
            </div>

            <div className="featured-grid">
                {featureList.map((exam) => (
                    <div
                        key={exam.id}
                        className="featured-card"
                        onClick={() => navigate(`/sinav/${exam.id}`)}
                    >
                        <div className="featured-image-wrapper">
                            {exam.imageUrl ? (
                                <img src={exam.imageUrl} alt={exam.name} />
                            ) : (
                                <div className="featured-mock-image">🎓</div>
                            )}
                        </div>

                        <div className="featured-content">
                            <div>
                                <div className="featured-top-row">
                                    <span className="featured-category">{exam.category || 'REHBER VE TEST'}</span>
                                    <div className="featured-price">
                                        {parseFloat(exam.price) > 0 ? `₺${exam.price}` : 'Ücretsiz'}
                                    </div>
                                </div>

                                <h3 className="featured-title">{exam.name}</h3>

                                <div className="featured-institution-name">
                                    <div className="inst-badge">
                                        {(exam.institution || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span>{exam.institution || 'UzmanGYS'}</span>
                                </div>
                            </div>

                            <div className="featured-footer">
                                <div className="meta-item">
                                    <FaUserFriends />
                                    <span>{(exam.enrolledCount || 100).toLocaleString()} öğrenci</span>
                                </div>
                                <div className="meta-item">
                                    <FaClock /> {/* Using Clock icon for question count contextually or change icon to List/File */}
                                    <span>{exam.questionCount || 100} Soru</span>
                                </div>
                                <div className="meta-item">
                                    <FaStar className="rating-star" />
                                    <span>{exam.rating || '5.0'}</span>
                                    <span className="text-xs text-gray-400">({exam.ratingCount || 45})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeaturedExams;
