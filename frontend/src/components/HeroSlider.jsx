import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { heroSlideAPI } from '../services/api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import './HeroSlider.css';

const defaultSlides = [
    {
        id: 'default-1',
        title: 'T.C. Tarım ve Orman Bakanlığı\nÜDS Ünvan Değişikliği\nSınav Kayıtları Başladı!',
        subtitle: 'Kariyerinizde yükselmek için en kapsamlı hazırlık seti ile rakiplerinizin önüne geçin.',
        buttonText: 'Hemen İncele',
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-58197bd47fd1?q=80&w=2070&auto=format&fit=crop',
        link: '/sinav/tarim-orman-uds'
    },
    {
        id: 'default-2',
        title: 'Sağlık Bakanlığı Görevde\nYükselme Sınavına Hazır Mısınız?',
        subtitle: 'Güncel mevzuat, on binlerce soru ve yapay zeka destekli analizlerle başarıyı garantileyin.',
        buttonText: 'Sınavı Seç',
        imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop',
        link: '/sinav/saglik-bakanligi-gys'
    },
    {
        id: 'default-3',
        title: 'Kamu Kariyerinizde\nYeni Bir Sayfa Açın',
        subtitle: 'Tüm bakanlık ve kurum sınavları için tek platform. Uzman eğitmenler ve detaylı çözümler yanınızda.',
        buttonText: 'Paketleri Gör',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
        link: '/paketler'
    }
];

const HeroSlider = () => {
    const navigate = useNavigate();
    const [slides, setSlides] = useState(defaultSlides);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await heroSlideAPI.getPublicSlides();
                if (res.success && res.data.slides.length > 0) {
                    setSlides(res.data.slides);
                }
            } catch (error) {
                console.error('Failed to fetch hero slides, using defaults', error);
            }
        };
        fetchSlides();
    }, []);

    if (!slides || slides.length === 0) return null;

    return (
        <div className="hero-slider-container">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade, Navigation]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 6000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + '"><span class="progress-bar"></span></span>';
                    },
                }}
                navigation={true}
                loop={slides.length > 1}
                className="hero-swiper"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="hero-slide">
                        {/* Background Image */}
                        <div
                            className="slide-bg"
                            style={{ backgroundImage: `url(${slide.imageUrl})` }}
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="slide-overlay"></div>

                        {/* Content */}
                        <div className="slide-content-wrapper container">
                            <div className="slide-content">
                                <h2 className="slide-title">
                                    {(slide.title || '').split('\n').map((line, i) => (
                                        <span key={i} className="slide-title-line" style={{ animationDelay: `${i * 0.1}s` }}>
                                            {line}
                                            <br />
                                        </span>
                                    ))}
                                </h2>
                                <p className="slide-subtitle">{slide.subtitle}</p>
                                <button
                                    className="slide-btn"
                                    onClick={() => navigate(slide.link || '/')}
                                >
                                    {slide.buttonText || 'İncele'}
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroSlider;

