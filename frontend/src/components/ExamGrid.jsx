import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import './ExamGrid.css';

function ExamGrid({ exams, loading }) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    // Filter or sort exams if needed (e.g. only show top 4-8 popular ones)
    // For now show all passed exams but maybe limit display count in real implementation
    // Reference image shows 8 cards (2 rows of 4)
    const displayExams = exams.slice(0, 8);

    return (
        <div className="exam-grid-container">
            <div className="exam-grid-header">
                <h2>Popüler Sınavlar</h2>
            </div>

            <div className="exam-grid">
                {displayExams.map((exam) => (
                    <div
                        key={exam.id}
                        className="exam-card"
                        onClick={() => navigate(`/sinav/${exam.id}`)}
                    >
                        <div className="exam-card-image">
                            {exam.imageUrl ? (
                                <img src={exam.imageUrl} alt={exam.name} />
                            ) : (
                                <div className="mock-image-container">
                                    <span className="book-stack-icon">📚</span>
                                </div>
                            )}
                        </div>

                        <div className="exam-card-content">
                            <div className="exam-meta-row">
                                <span className="exam-category-tag">
                                    {exam.institution || 'GENEL'}
                                </span>
                                {parseFloat(exam.price) > 0 ? (
                                    <span className="exam-price">₺{exam.price}</span>
                                ) : (
                                    <span className="exam-free">Ücretsiz</span>
                                )}
                            </div>

                            <h3 className="exam-title">{exam.name}</h3>

                            <div className="exam-card-footer">
                                <div className="exam-rating">
                                    <FaStar className="star-icon" />
                                    <span>{exam.rating || '4.8'}</span>
                                </div>
                                <div className="exam-students">
                                    {(exam.enrolledCount ? exam.enrolledCount.toLocaleString() : '1.2k') + ' öğrenci'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExamGrid;
