// Üyelik Sözleşmesi Page
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PrivacyPolicyPage.css';

function UyelikSozlesmesiPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setContent(`
**ÜYELİK SÖZLEŞMESİ**

**1. TARAFLAR**

İşbu Üyelik Sözleşmesi ("Sözleşme"), UzmanGYS ("Şirket") ile www.uzmangys.com ("Site") adresine üye olan kullanıcı ("Üye") arasında akdedilmiştir.

**2. SÖZLEŞMENİN KONUSU**

İşbu Sözleşme'nin konusu, Üye'nin Site'den faydalanma şartlarının belirlenmesidir.

**3. TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ**

3.1. Üye, Site'ye üye olurken verdiği kişisel ve diğer sair bilgilerin kanunlar önünde doğru olduğunu, Şirket'in bu bilgilerin gerçeğe aykırılığı nedeniyle uğrayacağı tüm zararları tazmin edeceğini beyan ve taahhüt eder.
3.2. Üye, kendisine verilen şifreyi başka kişi ya da kuruluşlara veremez, üyenin söz konusu şifreyi kullanma hakkı bizzat kendisine aittir.
3.3. Üye, Site'yi kullanırken yasal mevzuat hükümlerine riayet etmeyi ve bunları ihlal etmemeyi baştan kabul ve taahhüt eder.
3.4. Şirket, Site'nin içeriğini, tasarımını ve yazılımını dilediği zaman değiştirme hakkını saklı tutar.

**4. SÖZLEŞMENİN FESHİ**

İşbu sözleşme, Üye'nin üyeliğini iptal etmesi veya Şirket tarafından üyeliğinin iptal edilmesine kadar yürürlükte kalacaktır.

**5. YÜRÜRLÜK**

Üye'nin, üyelik kaydı yapması, üyelik sözleşmesinde yer alan tüm maddeleri okuduğu ve kabul ettiği anlamına gelir. İşbu Sözleşme üyenin üye olması anında akdedilmiş ve karşılıklı olarak yürürlülüğe girmiştir.
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
          <h1>📝 Üyelik Sözleşmesi</h1>
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

export default UyelikSozlesmesiPage;
