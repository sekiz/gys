// Terms Page - Kullanım Koşulları Sayfası
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { footerAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TermsPage.css';

function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  /* const { user } = useAuth(); */

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const response = await footerAPI.getTerms();
      if (response.success) {
        setContent(response.data.content || 'Kullanım koşulları içeriği henüz eklenmemiş.');
      }
    } catch (error) {
      console.error('Kullanım koşulları yükleme hatası:', error);
      setContent('Kullanım koşulları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="terms-page">
        <Header />
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="terms-page">
      <Header />
      <div className="container">
        <div className="content-wrapper">
          <h1>📜 Kullanım Koşulları</h1>
          <div className="content-body">
            {content.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') return <br key={index} />;
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TermsPage;
