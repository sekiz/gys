// Mesafeli Satış Sözleşmesi Page
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PrivacyPolicyPage.css';

function MesafeliSatisPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setContent(`
**MESAFELİ SATIŞ SÖZLEŞMESİ**

**1. TARAFLAR**

**Satıcı:**
Ünvanı: UzmanGYS
Adres: [Şirket Adresi Demodur]
E-posta: info@uzmangys.com

**Alıcı:**
Adı Soyadı: [Kullanıcı Adı]
Adres: [Kullanıcı Adresi]

**2. KONU**

İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait web sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

**3. SÖZLEŞME KONUSU ÜRÜN/HİZMET**

Ürün/Hizmetin Adı: GYS Hazırlık Paketi (Dijital İçerik)
Ödeme Şekli: Kredi Kartı / Havale
Teslimat: Elektronik ortamda anında erişim.

**4. GENEL HÜKÜMLER**

4.1. Alıcı, web sitesinde sözleşme konusu ürünün/hizmetin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
4.2. Sözleşme konusu hizmet, ödemenin gerçekleşmesiyle birlikte Alıcı'nın erişimine açılır.

**5. CAYMA HAKKI**

Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, **elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallar** (dijital içerikler, yazılımlar vb.) cayma hakkının istisnaları kapsamındadır. Bu nedenle, satın alınan dijital eğitim paketlerinde cayma ve iade hakkı bulunmamaktadır.
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
          <h1>📜 Mesafeli Satış Sözleşmesi</h1>
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

export default MesafeliSatisPage;
