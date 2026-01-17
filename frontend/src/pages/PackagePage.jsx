// Package Page - Paket Satın Alma Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, packageAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PackagePage.css';

function PackagePage() {
  const [exams, setExams] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [activePackage, setActivePackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedExam, setSelectedExam] = useState(null); // Seçilen paket (tek seçim)
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, [location.pathname]); // Sayfa her görüntülendiğinde verileri yenile

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      console.log('📦 Paket verileri yükleniyor...');
      
      // Public exams kullan (tüm aktif sınavları göster)
      const [examsResponse, packagesResponse, activePackageResponse] = await Promise.all([
        examAPI.getPublicExams().catch((err) => {
          console.error('❌ getPublicExams hatası:', err);
          const errorMessage = err.message || 'Bilinmeyen hata';
          // "Failed to fetch" hatası backend'e bağlanılamadığını gösterir
          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            return { 
              success: false, 
              data: { exams: [] }, 
              error: 'Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun (http://localhost:5000)' 
            };
          }
          return { success: false, data: { exams: [] }, error: errorMessage };
        }),
        packageAPI.getMyPackages().catch((err) => {
          console.error('❌ getMyPackages hatası:', err);
          return { success: false, data: { userPackages: [] }, error: err.message };
        }),
        packageAPI.getMyActivePackage().catch((err) => {
          console.error('❌ getMyActivePackage hatası:', err);
          return { success: false, data: { activePackage: null }, error: err.message };
        }),
      ]);

      console.log('📊 Response\'lar:', {
        exams: examsResponse,
        packages: packagesResponse,
        activePackage: activePackageResponse,
      });

      if (examsResponse.success) {
        console.log(`✅ ${examsResponse.data.exams.length} sınav yüklendi`);
        // Price'ları kontrol et
        examsResponse.data.exams.forEach(exam => {
          console.log(`📦 ${exam.name}: price = ${exam.price} (type: ${typeof exam.price})`);
        });
        setExams(examsResponse.data.exams);
      } else {
        console.warn('⚠️ Sınavlar yüklenemedi:', examsResponse.error || examsResponse.message);
        const errorText = examsResponse.error || examsResponse.message || 'Sınavlar yüklenirken bir hata oluştu.';
        setMessage({ 
          type: 'error', 
          text: errorText 
        });
        // Backend bağlantı hatası varsa, kullanıcıya daha açıklayıcı mesaj göster
        if (errorText.includes('Backend sunucusuna bağlanılamıyor')) {
          setExams([]); // Boş array set et
        }
      }

      if (packagesResponse.success) {
        console.log(`✅ ${packagesResponse.data.userPackages.length} paket yüklendi`);
        setMyPackages(packagesResponse.data.userPackages);
      } else {
        console.warn('⚠️ Paketler yüklenemedi:', packagesResponse.error || packagesResponse.message);
      }

      if (activePackageResponse.success && activePackageResponse.data.activePackage) {
        console.log('✅ Aktif paket yüklendi');
        setActivePackage(activePackageResponse.data.activePackage);
      }
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
      setMessage({ type: 'error', text: error.message || 'Veriler yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = (examId) => {
    // Tek seçim: eğer aynı paket seçilirse seçimi kaldır, değilse yeni seçimi yap
    setSelectedExam(prev => prev === examId ? null : examId);
  };

  const handlePaymentNotification = () => {
    if (!selectedExam) {
      setMessage({ type: 'error', text: 'Lütfen bir paket seçiniz.' });
      return;
    }
    
    const selectedExamData = exams.find(e => e.id === selectedExam);
    if (!selectedExamData) {
      setMessage({ type: 'error', text: 'Seçilen paket bulunamadı.' });
      return;
    }
    
    // Ödeme bildirim sayfasına git
    navigate('/paketler/odeme', { 
      state: { 
        selectedExams: [selectedExamData],
        totalPrice: parseFloat(selectedExamData.price) || 0
      } 
    });
  };

  const getPackageStatus = (examId) => {
    const userPackage = myPackages.find(pkg => pkg.examId === examId);
    if (!userPackage) return null;
    
    return {
      status: userPackage.status,
      purchasedAt: userPackage.purchasedAt,
      activatedAt: userPackage.activatedAt,
      expiresAt: userPackage.expiresAt,
    };
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: 'Beklemede', class: 'status-pending' },
      ACTIVE: { text: 'Aktif', class: 'status-active' },
      EXPIRED: { text: 'Süresi Dolmuş', class: 'status-expired' },
      CANCELLED: { text: 'İptal Edildi', class: 'status-cancelled' },
    };
    return badges[status] || { text: status, class: '' };
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="package-page">
      <Header />

      <div className="container">
        <div className="package-header">
          <h1>📦 Paket Yönetimi</h1>
          <p>Hazırlanmak istediğiniz sınav paketini seçin</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Aktif Paket Bilgisi */}
        {activePackage && (
          <div className="active-package-card">
            <div className="active-package-header">
              <h2>✅ Aktif Paketiniz</h2>
              <span className={getStatusBadge('ACTIVE').class}>
                {getStatusBadge('ACTIVE').text}
              </span>
            </div>
            <div className="active-package-content">
              <h3>{activePackage.exam.name}</h3>
              <p>{activePackage.exam.description}</p>
              <div className="package-details">
                <div className="detail-item">
                  <span className="detail-label">Aktif Edilme:</span>
                  <span className="detail-value">
                    {new Date(activePackage.activatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {activePackage.expiresAt && (
                  <div className="detail-item">
                    <span className="detail-label">Bitiş Tarihi:</span>
                    <span className="detail-value">
                      {new Date(activePackage.expiresAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/exam/${activePackage.exam.id}`)}
              >
                Pakete Git →
              </button>
            </div>
          </div>
        )}

        {/* Bekleyen Paketler */}
        {myPackages.filter(pkg => pkg.status === 'PENDING').length > 0 && (
          <div className="pending-packages-section">
            <h2>⏳ Bekleyen Paket Talepleri</h2>
            <div className="packages-grid">
              {myPackages
                .filter(pkg => pkg.status === 'PENDING')
                .map((pkg) => (
                  <div key={pkg.id} className="package-card pending">
                    <h3>{pkg.exam.name}</h3>
                    <p>{pkg.exam.description}</p>
                    <div className="package-status">
                      <span className={getStatusBadge(pkg.status).class}>
                        {getStatusBadge(pkg.status).text}
                      </span>
                    </div>
                    <div className="package-date">
                      Talep Tarihi: {new Date(pkg.purchasedAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Mevcut Paketler */}
        <div className="available-packages-section">
          <h2>📚 Mevcut Paketler</h2>
          {loading ? (
            <div className="no-packages">
              <p>Yükleniyor...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="no-packages">
              <p>Henüz paket bulunmamaktadır. Admin panelinden sınav ekleyebilirsiniz.</p>
              {user?.role === 'ADMIN' && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/yonetim/sinavlar')}
                  style={{ marginTop: '1rem' }}
                >
                  Sınav Ekle
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="packages-grid">
                {exams.map((exam) => {
                  const packageInfo = getPackageStatus(exam.id);
                  const isActive = packageInfo?.status === 'ACTIVE';
                  const isPending = packageInfo?.status === 'PENDING';
                  const hasPackage = packageInfo !== null;
                  const isSelected = selectedExam === exam.id;
                  const canSelect = !isActive && !isPending;

                  return (
                    <div
                      key={exam.id}
                      className={`package-card ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                      {canSelect && (
                        <div className="package-radio">
                          <input
                            type="radio"
                            name="selectedPackage"
                            checked={isSelected}
                            onChange={() => handleExamSelect(exam.id)}
                          />
                        </div>
                      )}
                      <div className="package-card-header">
                        <h3>{exam.name}</h3>
                        {hasPackage && (
                          <span className={getStatusBadge(packageInfo.status).class}>
                            {getStatusBadge(packageInfo.status).text}
                          </span>
                        )}
                      </div>
                      <p className="package-description">{exam.description}</p>
                      <div className="package-stats">
                        <span>📚 {exam._count?.topics || 0} Konu</span>
                      </div>
                      <div className="package-price">
                        <span className="price-label">Fiyat:</span>
                        <span className="price-value">
                          {exam.price && parseFloat(exam.price) > 0 
                            ? `${parseFloat(exam.price).toFixed(2)} ₺`
                            : 'Fiyat belirtilmemiş'}
                        </span>
                      </div>
                      <div className="package-actions">
                        {isActive ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/exam/${exam.id}`)}
                          >
                            Pakete Git →
                          </button>
                        ) : isPending ? (
                          <button className="btn btn-secondary" disabled>
                            Onay Bekleniyor...
                          </button>
                        ) : (
                          <div className="package-select-hint">
                            {canSelect && 'Satın almak için işaretleyin'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ödeme Bilgileri ve Buton */}
              {selectedExam && (
                <div className="payment-section">
                  <div className="payment-info-card">
                    <h3>💳 Ödeme Bilgileri</h3>
                    <div className="payment-details">
                      <div className="payment-account">
                        <p><strong>Banka:</strong> Örnek Banka A.Ş.</p>
                        <p><strong>Hesap Adı:</strong> UzmanGYS Platform</p>
                        <p><strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00</p>
                        <p><strong>Açıklama:</strong> {user?.name} - Paket Satın Alma</p>
                      </div>
                    </div>
                    <div className="payment-summary">
                      <div className="summary-row">
                        <span>Seçilen Paket:</span>
                        <strong>{exams.find(e => e.id === selectedExam)?.name}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Toplam Tutar:</span>
                        <strong className="total-price">
                          {(parseFloat(exams.find(e => e.id === selectedExam)?.price) || 0).toFixed(2)} ₺
                        </strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-large"
                      onClick={handlePaymentNotification}
                      disabled={requesting}
                    >
                      {requesting ? 'İşleniyor...' : '💳 Ödeme Bildirimi Yap'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PackagePage;
