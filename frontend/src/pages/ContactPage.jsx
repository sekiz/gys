import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <Header />

            <main className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-base-content mb-4">İletişim</h1>
                        <p className="text-lg text-base-content/70">
                            Sorularınız için bizimle iletişime geçmekten çekinmeyin.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                                            <FaPhone size={20} />
                                        </div>
                                        <h3 className="card-title text-base-content">Telefon</h3>
                                    </div>
                                    <p className="text-base-content/80">+90 (555) 555 55 55</p>
                                    <p className="text-sm text-base-content/60 mt-1">Hafta içi: 09:00 - 18:00</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                                            <FaEnvelope size={20} />
                                        </div>
                                        <h3 className="card-title text-base-content">E-posta</h3>
                                    </div>
                                    <p className="text-base-content/80">info@uzmangys.com</p>
                                    <p className="text-sm text-base-content/60 mt-1">7/24 Destek</p>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-accent/10 rounded-full text-accent">
                                            <FaMapMarkerAlt size={20} />
                                        </div>
                                        <h3 className="card-title text-base-content">Adres</h3>
                                    </div>
                                    <p className="text-base-content/80">Çankaya, Ankara, Türkiye</p>
                                    <p className="text-sm text-base-content/60 mt-1">Merkez Ofis</p>
                                </div>
                            </div>

                            <div className="card bg-[#25D366] text-white shadow-xl hover:bg-[#20bd5a] transition-colors cursor-pointer">
                                <div className="card-body flex-row items-center gap-4">
                                    <FaWhatsapp size={24} />
                                    <div>
                                        <h3 className="font-bold text-lg">WhatsApp Destek</h3>
                                        <p className="text-white/90">Hızlı iletişim için tıklayın</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="card bg-base-100 shadow-xl h-full">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl mb-6 text-base-content">Bize Mesaj Gönderin</h2>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control w-full">
                                                <label className="label">
                                                    <span className="label-text">Adınız Soyadınız</span>
                                                </label>
                                                <input type="text" placeholder="Örn: Ahmet Yılmaz" className="input input-bordered w-full" />
                                            </div>
                                            <div className="form-control w-full">
                                                <label className="label">
                                                    <span className="label-text">E-posta Adresiniz</span>
                                                </label>
                                                <input type="email" placeholder="ornek@email.com" className="input input-bordered w-full" />
                                            </div>
                                        </div>

                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text">Konu</span>
                                            </label>
                                            <select className="select select-bordered w-full">
                                                <option disabled selected>Seçiniz</option>
                                                <option>Genel Bilgi</option>
                                                <option>Üyelik İşlemleri</option>
                                                <option>Teknik Destek</option>
                                                <option>Ödeme ve Fatura</option>
                                                <option>Diğer</option>
                                            </select>
                                        </div>

                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text">Mesajınız</span>
                                            </label>
                                            <textarea className="textarea textarea-bordered h-32" placeholder="Mesajınızı buraya yazınız..."></textarea>
                                        </div>

                                        <div className="card-actions justify-end mt-6">
                                            <button className="btn btn-primary w-full md:w-auto" type="button" onClick={() => alert('Mesajınız alındı (Simülasyon)')}>
                                                Mesajı Gönder
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ContactPage;
