// Kişisel Verilerin Kullanılması ve İşlenmesi Page
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PrivacyPolicyPage.css';

function KisiselVerilerPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setContent(`
**KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ**

**1. Veri Sorumlusu**

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, UzmanGYS olarak, veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar ve yöntemlerle işlemekteyiz.

**2. Kişisel Verilerin İşlenme Amacı**

Kişisel verileriniz;
*   Üyelik işlemlerinin gerçekleştirilmesi,
*   Hizmetlerin sunulması ve faturalandırılması,
*   Müşteri memnuniyeti aktivitelerinin planlanması,
*   Hukuki taleplerin karşılanması,
amaçlarıyla işlenmektedir.

**3. İşlenen Kişisel Veriler**

İşlenen kişisel verileriniz şunlardır: Kimlik bilgileri (Ad, Soyad), İletişim bilgileri (E-posta, Telefon, Adres), ve Müşteri işlem bilgileri.

**4. Kişisel Veri Toplama Yöntemi ve Hukuki Sebebi**

Kişisel verileriniz, web sitemiz, mobil uygulamamız veya e-posta yoluyla elektronik ortamda toplanmaktadır. Bu toplama faaliyeti, "Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması" ve "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması" hukuki sebeplerine dayanmaktadır.

**5. İlgili Kişinin Hakları**

KVKK'nın 11. maddesi uyarınca, veri sahibi olarak;
*   Kişisel verilerinizin işlenip işlenmediğini öğrenme,
*   İşlenmişse buna ilişkin bilgi talep etme,
*   İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
*   Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme,
*   Eksik veya yanlış işlenmişse düzeltilmesini isteme,
haklarına sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
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
          <h1>🔐 KVKK Aydınlatma Metni</h1>
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

export default KisiselVerilerPage;
