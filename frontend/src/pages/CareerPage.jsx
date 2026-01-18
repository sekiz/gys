import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaLaptopCode, FaBookReader, FaCoffee, FaUsers } from 'react-icons/fa';

function CareerPage() {
    const positions = [
        {
            title: "Senior Frontend Geliştirici (React)",
            type: "Tam Zamanlı",
            location: "Uzaktan / Ankara",
            department: "Yazılım",
            description: "Modern web teknolojileri ve React ekosisteminde deneyimli, kullanıcı deneyimini ön planda tutan takım arkadaşı arıyoruz."
        },
        {
            title: "Eğitim İçerik Editörü (Hukuk)",
            type: "Yarı Zamanlı / Proje Bazlı",
            location: "Uzaktan",
            department: "İçerik",
            description: "Görevde yükselme sınavları için hukuk mevzuatına hakim, soru hazırlayabilecek ve konu anlatımı yazabilecek editörler arıyoruz."
        },
        {
            title: "Dijital Pazarlama Uzmanı",
            type: "Tam Zamanlı",
            location: "Ankara",
            department: "Pazarlama",
            description: "Sosyal medya yönetimi, Google Ads ve SEO konularında deneyimli pazarlama uzmanı arıyoruz."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="hero bg-base-100 py-20">
                    <div className="hero-content text-center">
                        <div className="max-w-3xl">
                            <h1 className="text-5xl font-bold mb-6 text-base-content">Geleceği Birlikte İnşa Edelim</h1>
                            <p className="py-6 text-xl text-base-content/70">
                                UzmanGYS olarak Türkiye'nin en hızlı büyüyen online eğitim platformlarından biriyiz. Siz de bu heyecan verici ve anlamlı yolculukta yerinizi alın.
                            </p>
                            <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('positions').scrollIntoView({ behavior: 'smooth' })}>
                                Açık Pozisyonlar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <section className="py-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-3xl font-bold text-center mb-12 text-base-content">Neden UzmanGYS?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <FaLaptopCode size={32} />, title: "Hibrit Çalışma", desc: "Ofis veya ev, nerede verimliysen orası ofisin." },
                                { icon: <FaBookReader size={32} />, title: "Sürekli Gelişim", desc: "Eğitim materyallerine sınırsız erişim ve gelişim bütçesi." },
                                { icon: <FaCoffee size={32} />, title: "Rahat Ortam", desc: "Hiyerarşiden uzak, fikirlerin önemsendiği çalışma ortamı." },
                                { icon: <FaUsers size={32} />, title: "Harika Takım", desc: "Yardımlaşmayı seven, dinamik ve eğlenceli takım arkadaşları." }
                            ].map((benefit, idx) => (
                                <div key={idx} className="card bg-base-100 shadow-lg text-center hover:-translate-y-2 transition-transform duration-300">
                                    <div className="card-body items-center">
                                        <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                                            {benefit.icon}
                                        </div>
                                        <h3 className="card-title mb-2 text-base-content">{benefit.title}</h3>
                                        <p className="text-base-content/70">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section id="positions" className="py-16 px-4 bg-base-100">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold text-center mb-12 text-base-content">Açık Pozisyonlar</h2>
                        <div className="space-y-4">
                            {positions.map((job, idx) => (
                                <div key={idx} className="collapse collapse-plus bg-base-200 border border-base-300 rounded-box">
                                    <input type="checkbox" name="my-accordion-3" />
                                    <div className="collapse-title text-xl font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <span className="text-base-content">{job.title}</span>
                                        <div className="flex gap-2">
                                            <span className="badge badge-primary badge-outline">{job.type}</span>
                                            <span className="badge badge-secondary badge-outline">{job.department}</span>
                                        </div>
                                    </div>
                                    <div className="collapse-content">
                                        <p className="py-4 text-base-content/80">{job.description}</p>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                                            <span className="text-sm opacity-70 flex items-center gap-1">📍 {job.location}</span>
                                            <button className="btn btn-primary btn-sm">Başvur</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <p className="text-base-content/70 mb-4">Aradığınız pozisyonu bulamadınız mı?</p>
                            <button className="btn btn-outline">Genel Başvuru Yap</button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default CareerPage;
