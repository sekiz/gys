// Payment Notification Page - Ödeme Bildirimi Sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PaymentNotificationPage.css';

function PaymentNotificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedExams, setSelectedExams] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: '',
    paymentAmount: '',
    paymentMethod: 'BANK_TRANSFER', // Sadece Banka Havalesi/EFT
    transactionId: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Location state'den seçilen paketleri al
    if (location.state?.selectedExams) {
      setSelectedExams(location.state.selectedExams);
      setTotalPrice(location.state.totalPrice || 0);
      setPaymentForm(prev => ({
        ...prev,
        paymentAmount: location.state.totalPrice?.toFixed(2) || '0.00',
      }));
    } else {
      // Eğer state yoksa packages sayfasına yönlendir
      navigate('/paketler');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentForm.paymentDate || !paymentForm.paymentAmount) {
      setMessage({ type: 'error', text: 'Lütfen ödeme tarihi ve tutarı giriniz.' });
      return;
    }

    if (parseFloat(paymentForm.paymentAmount) <= 0) {
      setMessage({ type: 'error', text: 'Ödeme tutarı 0\'dan büyük olmalıdır.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      // Her seçilen paket için talep oluştur
      const requests = selectedExams.map(exam => 
        packageAPI.requestPackage(exam.id, {
          paymentDate: paymentForm.paymentDate,
          paymentAmount: parseFloat(paymentForm.paymentAmount),
          paymentMethod: paymentForm.paymentMethod,
          transactionId: paymentForm.transactionId || null,
          notes: paymentForm.notes || null,
        })
      );

      const results = await Promise.all(requests);

      // Tüm talepler başarılı mı kontrol et
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        setMessage({ 
          type: 'success', 
          text: 'Ödeme bildirimi başarıyla gönderildi. Admin onayı bekleniyor.' 
        });
        
        // 2 saniye sonra packages sayfasına yönlendir
        setTimeout(() => {
          navigate('/paketler');
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Bazı paket talepleri oluşturulamadı. Lütfen tekrar deneyiniz.' 
        });
      }
    } catch (error) {
      console.error('Ödeme bildirimi hatası:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Ödeme bildirimi gönderilirken bir hata oluştu.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedExams.length === 0) {
    return null; // useEffect'te navigate edilecek
  }

  return (
    <div className="payment-notification-page">
      <Header />

      <div className="container">
        <div className="payment-header">
          <h1>💳 Ödeme Bildirimi</h1>
          <p>Ödeme yaptıktan sonra lütfen aşağıdaki bilgileri doldurunuz</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="payment-content">
          {/* Seçilen Paketler */}
          <div className="selected-packages-card">
            <h3>📦 Seçilen Paketler</h3>
            <div className="packages-list">
              {selectedExams.map((exam) => (
                <div key={exam.id} className="package-item">
                  <div className="package-item-info">
                    <h4>{exam.name}</h4>
                    <p>{exam.description}</p>
                  </div>
                  <div className="package-item-price">
                    {parseFloat(exam.price || 0).toFixed(2)} ₺
                  </div>
                </div>
              ))}
            </div>
            <div className="packages-total">
              <span>Toplam Tutar:</span>
              <strong>{totalPrice.toFixed(2)} ₺</strong>
            </div>
          </div>

          {/* Ödeme Bilgileri */}
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
          </div>

          {/* Ödeme Bildirim Formu */}
          <div className="payment-form-card">
            <h3>📝 Ödeme Bildirim Formu</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ödeme Tarihi *</label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]} // Bugünden önceki tarih seçilemez
                />
              </div>

              <div className="form-group">
                <label>Ödeme Tutarı (₺) *</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  min="0.01"
                  value={paymentForm.paymentAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentAmount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ödeme Yöntemi</label>
                <div className="payment-method-info">
                  <span className="payment-method-badge">🏦 Banka Havalesi / EFT</span>
                  <p className="payment-method-note">Ödeme yöntemi: Banka Havalesi veya EFT</p>
                </div>
              </div>

              <div className="form-group">
                <label>İşlem No / Referans No</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                  placeholder="Örn: 1234567890"
                />
              </div>

              <div className="form-group">
                <label>Notlar / Açıklamalar</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Eklemek istediğiniz notlar..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/packages')}
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Gönderiliyor...' : '✅ Ödeme Bildirimini Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PaymentNotificationPage;
