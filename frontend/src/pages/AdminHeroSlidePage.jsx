import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { heroSlideAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminHeroSlidePage.css';

function AdminHeroSlidePage() {
    const { user } = useAuth();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        buttonText: 'İncele',
        link: '/',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            const res = await heroSlideAPI.getAllSlides();
            if (res.success) {
                setSlides(res.data.slides);
            }
        } catch (err) {
            setError('Slides yüklenirken hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (slide) => {
        setEditingSlide(slide);
        setFormData({
            title: slide.title,
            subtitle: slide.subtitle || '',
            imageUrl: slide.imageUrl,
            buttonText: slide.buttonText,
            link: slide.link,
            order: slide.order,
            isActive: slide.isActive
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingSlide(null);
        setFormData({
            title: '',
            subtitle: '',
            imageUrl: '',
            buttonText: 'İncele',
            link: '/',
            order: slides.length,
            isActive: true
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
            try {
                await heroSlideAPI.deleteSlide(id);
                loadSlides();
            } catch (err) {
                alert('Silme işlemi başarısız');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSlide) {
                await heroSlideAPI.updateSlide(editingSlide.id, formData);
            } else {
                await heroSlideAPI.createSlide(formData);
            }
            setShowModal(false);
            loadSlides();
        } catch (err) {
            alert('Kaydetme başarısız: ' + err.message);
        }
    };

    const handleMove = async (index, direction) => {
        // Basic reorder: swap orders locally then full reload ?
        // Or just swap orders of two items and save both? 
        // Implementing simple swap logic
        if (direction === 'up' && index > 0) {
            const newSlides = [...slides];
            const temp = newSlides[index];
            newSlides[index] = newSlides[index - 1];
            newSlides[index - 1] = temp;

            // Update orders based on new index
            const ids = newSlides.map(s => s.id);
            await heroSlideAPI.reorderSlides(ids);
            loadSlides();
        } else if (direction === 'down' && index < slides.length - 1) {
            const newSlides = [...slides];
            const temp = newSlides[index];
            newSlides[index] = newSlides[index + 1];
            newSlides[index + 1] = temp;

            const ids = newSlides.map(s => s.id);
            await heroSlideAPI.reorderSlides(ids);
            loadSlides();
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return <div className="p-10">Yetkiniz yok.</div>;
    }

    return (
        <div className="admin-page">

            <div className="admin-container">
                <div className="admin-header">
                    <h1>Anasayfa Slider Yönetimi</h1>
                    <button className="btn-primary" onClick={handleCreate}>+ Yeni Slayt Ekle</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="slides-list">
                    {loading ? (
                        <p>Yükleniyor...</p>
                    ) : (
                        slides.map((slide, index) => (
                            <div key={slide.id} className={`slide-item ${!slide.isActive ? 'inert' : ''}`}>
                                <div className="slide-preview">
                                    <img src={slide.imageUrl} alt="preview" />
                                </div>
                                <div className="slide-info">
                                    <h3>{slide.title}</h3>
                                    <p>{slide.subtitle}</p>
                                    <div className="badges">
                                        <span className="badge">{slide.order}</span>
                                        {slide.isActive ? <span className="badge success">Aktif</span> : <span className="badge warning">Pasif</span>}
                                    </div>
                                </div>
                                <div className="slide-actions">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0}>⬆️</button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === slides.length - 1}>⬇️</button>
                                    <button onClick={() => handleEdit(slide)}>✏️ Düzenle</button>
                                    <button onClick={() => handleDelete(slide.id)} className="btn-danger">🗑️ Sil</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Başlık</label>
                                <textarea
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Başlık (Satır atlamak için Enter kullanın)"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Alt Başlık</label>
                                <textarea
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label>Görsel URL</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Preview" className="img-preview-small" />
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Buton Metni</label>
                                    <input
                                        type="text"
                                        value={formData.buttonText}
                                        onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Buton Linki</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: e.target.value })}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Aktif
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">İptal</button>
                                <button type="submit" className="btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminHeroSlidePage;
