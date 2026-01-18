import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function FaqPage() {
    const faqs = [
        {
            question: "Sitenize nasıl üye olabilirim?",
            answer: "Anasayfada sağ üst köşede bulunan 'Kayıt Ol' veya 'Aramıza Katıl' butonuna tıklayarak kayıt formuna ulaşabilir ve üyeliğinizi saniyeler içinde oluşturabilirsiniz."
        },
        {
            question: "Üyelik oluşturamıyorum. Yardımcı olur musunuz?",
            answer: "Kayıt işlemleri sırasında sorun yaşıyorsanız, tarayıcınızın çerezlerini temizleyip tekrar deneyebilir veya 'Kayıt Ol' sayfasındaki formu eksiksiz doldurduğunuzdan emin olabilirsiniz. Sorun devam ederse İletişim sayfasından bize ulaşabilirsiniz."
        },
        {
            question: "Sınav paketleri geçerlilik süresi ne kadar?",
            answer: "Satın aldığınız sınav paketleri ve üyelikler, aksi belirtilmedikçe satın alma tarihinden itibaren 1 yıl (12 ay) süreyle geçerlidir. Bu süre boyunca tüm içeriklere sınırsız erişim sağlayabilirsiniz."
        },
        {
            question: "Ödeme işlemi güvenli mi?",
            answer: "Evet, ödemeleriniz 256-bit SSL güvenlik sertifikası ve 3D Secure altyapısı ile korunmaktadır. Kredi kartı bilgileriniz sistemimizde saklanmaz ve bankanız ile doğrudan güvenli bağlantı kurulur."
        },
        {
            question: "Siparişimi iptal edebilir miyim?",
            answer: "Mesafeli Sözleşmeler Yönetmeliği gereğince, elektronik ortamda anında ifa edilen hizmetler (dijital içerikler, online sınavlar vb.) cayma hakkının istisnası kapsamındadır. Bu nedenle, satın alınan dijital paketlerde iptal ve iade işlemi yapılamamaktadır. Lütfen satın almadan önce deneme sürümlerimizi inceleyiniz."
        },
        {
            question: "Hangi üyelik paketini almalıyım?",
            answer: "İhtiyacınıza göre farklı paketlerimiz mevcuttur. Sadece soru çözmek isterseniz Soru Bankası paketlerini, konu anlatımı ve ders notları da isterseniz Tam Kapsamlı (Premium) paketleri tercih edebilirsiniz. Detaylı karşılaştırma için 'Paketler' sayfasını inceleyebilirsiniz."
        },
        {
            question: "Mobilden giriş yapabilir miyim?",
            answer: "Evet! UzmanGYS platformu tüm mobil cihazlar (telefon, tablet) ile tam uyumludur. Uygulamamızı App Store veya Google Play'den indirerek veya mobil tarayıcınızdan giriş yaparak dilediğiniz yerden çalışabilirsiniz."
        },
        {
            question: "Şifremi unuttum, ne yapmalıyım?",
            answer: "Giriş yap sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayarak kayıtlı e-posta adresinizi girebilirsiniz. Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Header />

            <main className="flex-grow py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-base-content mb-4">Sıkça Sorulan Sorular</h1>
                        <p className="text-lg text-base-content/70">
                            Aklınıza takılan soruların yanıtlarını burada bulabilirsiniz.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box shadow-sm">
                                <input type="checkbox" name="my-accordion-2" defaultChecked={idx === 0} />
                                <div className="collapse-title text-xl font-medium text-base-content">
                                    {faq.question}
                                </div>
                                <div className="collapse-content">
                                    <p className="text-base-content/80 text-lg leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 p-8 bg-base-100 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-bold mb-4 text-base-content">Aradığınız cevabı bulamadınız mı?</h3>
                        <p className="text-base-content/70 mb-6">Ekibimiz size yardımcı olmaktan mutluluk duyacaktır.</p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="/iletisim" className="btn btn-primary">Bize Ulaşın</a>
                            <a href="mailto:info@uzmangys.com" className="btn btn-outline">E-posta Gönder</a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default FaqPage;
