// Privacy Policy Page - Gizlilik Politikası Sayfası
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PrivacyPolicyPage.css';

function PrivacyPolicyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating loading logic but providing static demo content
    setTimeout(() => {
      setContent(`
**1. Gizlilik Politikası Amacı**

UzmanGYS olarak ("Şirket"), kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, web sitemizi kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklar.

**2. Toplanan Veriler**

Hizmetlerimizi kullanırken aşağıdaki kişisel verileri toplayabiliriz:
*   **Kimlik Bilgileri:** Ad, soyad, T.C. kimlik numarası (gerekirse).
*   **İletişim Bilgileri:** E-posta adresi, telefon numarası, adres.
*   **İşlem Bilgileri:** Satın alma geçmişi, ödeme bilgileri.
*   **Teknik Bilgiler:** IP adresi, tarayıcı türü, cihaz bilgileri.

**3. Verilerin Kullanım Amacı**

Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
*   Hizmetlerimizin sunulması ve iyileştirilmesi.
*   Hukuki yükümlülüklerin yerine getirilmesi.
*   Müşteri desteği sağlanması.
*   Pazarlama ve bilgilendirme faaliyetleri (onayınız dahilinde).

**4. Verilerin Paylaşımı**

Kişisel verileriniz, yasal zorunluluklar haricinde veya açık rızanız olmaksızın üçüncü taraflarla paylaşılmaz. Hizmet sağlayıcılarımız (ödeme sistemleri, sunucu hizmetleri vb.) ile gerekli olduğu ölçüde veri paylaşımı yapılabilir.

**5. Veri Güvenliği**

Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri (SSL şifreleme, güvenlik duvarları vb.) kullanıyoruz.

**6. Değişiklikler**

Bu Gizlilik Politikası zaman zaman güncellenebilir. Güncellemeler web sitemizde yayınlandığı tarihte yürürlüğe girer.
        `);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className="privacy-policy-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="privacy-policy-page">
      <Header />
      <div className="container">
        <div className="content-wrapper">
          <h1>🔒 Gizlilik Politikası</h1>
          <div className="content-body">
            {content.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') return <br key={index} />;
              const parts = paragraph.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={index}>
                  {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;
