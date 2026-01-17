// Cookie Policy Page - Çerez Politikası Sayfası
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PrivacyPolicyPage.css'; // Reusing existing styles for consistency

function CookiePolicyPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating loading for consistency, but using static data
        setTimeout(() => {
            setContent(`
**1. Çerez Politikası Hakkında**

UzmanGYS olarak, web sitemizdeki deneyiminizi geliştirmek için çerezler kullanıyoruz. Bu Çerez Politikası, web sitemizi ziyaret ettiğinizde ne tür çerezler kullandığımızı ve bunları nasıl kontrol edebileceğinizi açıklar.

**2. Çerez Nedir?**

Çerezler (Cookies), web siteleri tarafından cihazınıza (bilgisayar, telefon, tablet vb.) kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin sizi hatırlamasını ve tercihlerinizi saklamasını sağlar.

**3. Kullandığımız Çerez Türleri**

*   **Zorunlu Çerezler:** Web sitesinin düzgün çalışması için gereklidir. Oturum açma, güvenli alanlara erişim gibi temel işlevleri sağlarlar.
*   **Performans ve Analiz Çerezleri:** Ziyaretçilerin web sitesini nasıl kullandığını analiz etmek için kullanılır (örn. en çok ziyaret edilen sayfalar). Bu veriler anonim olarak toplanır.
*   **İşlevsellik Çerezleri:** Dil tercihi veya kullanıcı adı gibi seçimlerinizi hatırlayarak size daha kişiselleştirilmiş bir deneyim sunar.
*   **Hedefleme ve Reklam Çerezleri:** İlgi alanlarınıza göre size uygun içerik ve reklamlar göstermek için kullanılır.

**4. Çerezleri Nasıl Yönetebilirsiniz?**

Tarayıcı ayarlarınızı değiştirerek çerezleri kabul edebilir, reddedebilir veya silebilirsiniz. Ancak, bazı çerezleri devre dışı bırakmak web sitesinin bazı özelliklerinin çalışmamasına neden olabilir.

**5. İletişim**

Çerez politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz.
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
                    <h1>🍪 Çerez Politikası</h1>
                    <div className="content-body">
                        {content.split('\n').map((paragraph, index) => {
                            if (paragraph.trim() === '') return <br key={index} />;
                            // Simple markdown-like bold parsing
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

export default CookiePolicyPage;
