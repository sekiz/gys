import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="hero min-h-[400px]" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}>
                    <div className="hero-overlay bg-opacity-80 bg-gray-900"></div>
                    <div className="hero-content text-center text-neutral-content">
                        <div className="max-w-2xl">
                            <h1 className="mb-5 text-5xl font-bold text-white">Hakkımızda</h1>
                            <p className="mb-5 text-lg text-gray-200">
                                UzmanGYS, kamu personeli adaylarının hayallerindeki kariyere ulaşmaları için en güncel ve kapsamlı hazırlık platformudur.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-base-content">Misyonumuz</h2>
                                <p className="text-lg leading-relaxed text-base-content/80 mb-8">
                                    Kamu görevde yükselme ve unvan değişikliği sınavlarına hazırlanan adaylara; zaman ve mekandan bağımsız, erişilebilir, güncel ve kaliteli eğitim materyalleri sunarak başarı oranlarını artırmak.
                                </p>
                                <h2 className="text-3xl font-bold mb-6 text-base-content">Vizyonumuz</h2>
                                <p className="text-lg leading-relaxed text-base-content/80">
                                    Türkiye'nin en güvenilir ve en çok tercih edilen dijital sınav hazırlık platformu olmak ve kamu personelinin gelişimine katkı sağlamak.
                                </p>
                            </div>
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                                    alt="Ofis ortamı"
                                    className="rounded-2xl shadow-2xl w-full object-cover h-[400px]"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-content p-6 rounded-xl shadow-xl hidden md:block">
                                    <div className="text-4xl font-bold mb-2">10+</div>
                                    <div className="text-sm opacity-90">Yıllık Tecrübe</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-base-100 py-16">
                    <div className="container mx-auto px-4">
                        <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200">
                            <div className="stat place-items-center">
                                <div className="stat-title">Toplam Soru</div>
                                <div className="stat-value text-primary">50,000+</div>
                                <div className="stat-desc">Sürekli güncellenen havuz</div>
                            </div>

                            <div className="stat place-items-center">
                                <div className="stat-title">Başarılı Öğrenci</div>
                                <div className="stat-value text-secondary">25,000+</div>
                                <div className="stat-desc">Referansımız başarınızdır</div>
                            </div>

                            <div className="stat place-items-center">
                                <div className="stat-title">Sınav Kategorisi</div>
                                <div className="stat-value">15+</div>
                                <div className="stat-desc">Farklı bakanlık ve kurumlar</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team (Optional Mock) */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 text-base-content">Ekibimiz</h2>
                            <p className="text-base-content/70">Alanında uzman eğitimci ve yazılımcı kadromuz</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { name: "Ahmet Yılmaz", role: "Kurucu & Eğitim Koordinatörü", img: "https://i.pravatar.cc/300?img=11" },
                                { name: "Ayşe Demir", role: "İçerik Editörü", img: "https://i.pravatar.cc/300?img=5" },
                                { name: "Mehmet Kaya", role: "Baş Yazılımcı", img: "https://i.pravatar.cc/300?img=3" },
                                { name: "Zeynep Çelik", role: "Müşteri Deneyimi", img: "https://i.pravatar.cc/300?img=9" }
                            ].map((member, idx) => (
                                <div key={idx} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    <figure className="px-10 pt-10">
                                        <img src={member.img} alt={member.name} className="rounded-full w-24 h-24 object-cover ring ring-primary ring-offset-base-100 ring-offset-2" />
                                    </figure>
                                    <div className="card-body items-center text-center">
                                        <h2 className="card-title text-base-content">{member.name}</h2>
                                        <p className="text-sm text-base-content/70">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default AboutPage;
