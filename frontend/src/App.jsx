// Main App Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ExamPage from './pages/ExamPage';
import TopicDetailPage from './pages/TopicDetailPage';
import MixedQuizPage from './pages/MixedQuizPage';
import StatsPage from './pages/StatsPage';
import RankingPage from './pages/RankingPage';
import PackagePage from './pages/PackagePage';
import PaymentNotificationPage from './pages/PaymentNotificationPage';
import AdminPackagePage from './pages/AdminPackagePage';
import AdminExamPage from './pages/AdminExamPage';
import AdminContentPage from './pages/AdminContentPage';
import AdminUserPage from './pages/AdminUserPage';
import AdminQuestionReportsPage from './pages/AdminQuestionReportsPage';
import AdminHeroSlidePage from './pages/AdminHeroSlidePage';
import AdminFooterPage from './pages/AdminFooterPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import TermsPage from './pages/TermsPage';
import MesafeliSatisPage from './pages/MesafeliSatisPage';
import KisiselVerilerPage from './pages/KisiselVerilerPage';
import UyelikSozlesmesiPage from './pages/UyelikSozlesmesiPage';
import PracticeExamListPage from './pages/PracticeExamListPage';
import PracticeExamPage from './pages/PracticeExamPage';
import PracticeExamResultPage from './pages/PracticeExamResultPage';
import PracticeExamResultDetailPage from './pages/PracticeExamResultDetailPage';
import AdminPracticeExamPage from './pages/AdminPracticeExamPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLayout from './layouts/AdminLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareerPage from './pages/CareerPage';
import FaqPage from './pages/FaqPage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/giris" replace />;
  }

  return children;
}

// Redirect Components for parameterized routes
function RedirectExam() {
  const { id } = useParams();
  return <Navigate to={`/sinav/${id}`} replace />;
}

function RedirectTopic() {
  const { id } = useParams();
  return <Navigate to={`/konu/${id}`} replace />;
}

function RedirectExamContent() {
  const { examId } = useParams();
  return <Navigate to={`/yonetim/sinavlar/${examId}/icerik`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/giris" element={<LoginPage />} />
      <Route path="/kayit" element={<RegisterPage />} />
      <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
      {/* Eski URL'lere redirect */}
      <Route path="/login" element={<Navigate to="/giris" replace />} />
      <Route path="/register" element={<Navigate to="/kayit" replace />} />
      {/* Türkçe SEO URL'leri */}
      <Route
        path="/anasayfa"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sinav/:id"
        element={
          <ProtectedRoute>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/konu/:id"
        element={
          <ProtectedRoute>
            <TopicDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/karisik"
        element={
          <ProtectedRoute>
            <MixedQuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deneme-sinavlari"
        element={
          <ProtectedRoute>
            <PracticeExamListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deneme-sinavi/:id"
        element={
          <ProtectedRoute>
            <PracticeExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deneme-sinavi/:id/sonuc"
        element={
          <ProtectedRoute>
            <PracticeExamResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deneme-sinavi-sonuc/:resultId"
        element={
          <ProtectedRoute>
            <PracticeExamResultDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/istatistikler"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/siralama"
        element={
          <ProtectedRoute>
            <RankingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paketler"
        element={
          <ProtectedRoute>
            <PackagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paketler/odeme"
        element={
          <ProtectedRoute>
            <PaymentNotificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />


      {/* Admin Panel Routes (Wrapped in AdminLayout) */}
      <Route path="/yonetim" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} /> {/* Dashboard as index */}
        <Route path="dashboard" element={<AdminDashboardPage />} /> {/* Optional explicit path */}
        <Route path="sinavlar" element={<AdminExamPage />} />
        <Route path="sinavlar/:examId/icerik" element={<AdminContentPage />} />
        <Route path="paketler" element={<AdminPackagePage />} />
        <Route path="kullanicilar" element={<AdminUserPage />} />
        <Route path="hatali-sorular" element={<AdminQuestionReportsPage />} />
        <Route path="slider" element={<AdminHeroSlidePage />} />
        <Route path="footer" element={<AdminFooterPage />} />
        <Route path="deneme-sinavlari" element={<AdminPracticeExamPage />} />
      </Route>

      {/* Eski URL'lere redirect (SEO ve geriye dönük uyumluluk için) */}
      <Route path="/dashboard" element={<Navigate to="/anasayfa" replace />} />
      <Route
        path="/exam/:id"
        element={<RedirectExam />}
      />
      <Route
        path="/topic/:id"
        element={<RedirectTopic />}
      />
      <Route path="/quiz/mixed" element={<Navigate to="/quiz/karisik" replace />} />
      <Route path="/stats" element={<Navigate to="/istatistikler" replace />} />
      <Route path="/packages" element={<Navigate to="/paketler" replace />} />
      <Route path="/packages/payment" element={<Navigate to="/paketler/odeme" replace />} />
      <Route path="/profile" element={<Navigate to="/profil" replace />} />
      <Route path="/admin/exams" element={<Navigate to="/yonetim/sinavlar" replace />} />
      <Route
        path="/admin/exams/:examId/content"
        element={<RedirectExamContent />}
      />
      <Route path="/admin/packages" element={<Navigate to="/yonetim/paketler" replace />} />
      <Route path="/admin/users" element={<Navigate to="/yonetim/kullanicilar" replace />} />
      <Route path="/admin/question-reports" element={<Navigate to="/yonetim/hatali-sorular" replace />} />
      <Route path="/admin/footer" element={<Navigate to="/yonetim/footer" replace />} />
      <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />
      <Route path="/cerez-politikasi" element={<CookiePolicyPage />} />
      <Route path="/kullanim-kosullari" element={<TermsPage />} />
      <Route path="/mesafeli-satis-sozlesmesi" element={<MesafeliSatisPage />} />
      <Route path="/kisisel-veriler" element={<KisiselVerilerPage />} />
      <Route path="/uyelik-sozlesmesi" element={<UyelikSozlesmesiPage />} />
      <Route path="/hakkimizda" element={<AboutPage />} />
      <Route path="/iletisim" element={<ContactPage />} />
      <Route path="/kariyer" element={<CareerPage />} />
      <Route path="/sss" element={<FaqPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
