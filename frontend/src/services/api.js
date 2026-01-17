// API Service - Backend ile iletişim
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Token'ı localStorage'dan al
function getToken() {
  return localStorage.getItem('token');
}

// Token'ı localStorage'a kaydet
function setToken(token) {
  localStorage.setItem('token', token);
}

// Token'ı sil
function removeToken() {
  localStorage.removeItem('token');
}

// API isteği yap
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Response'un content-type'ını kontrol et
    // Response'un content-type'ını kontrol et

    // Response body'yi parse et
    let data;
    try {
      // Eğer response boşsa veya JSON değilse
      const text = await response.text();

      if (!text || text.trim() === '') {
        // Boş response durumu
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // Boş ama başarılı response
        return { success: true, data: null };
      }

      // JSON parse et
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('JSON Parse Hatası:', jsonError);
        console.error('Response Text:', text);
        // Eğer text bir hata mesajıysa, onu kullan
        if (text && text.length < 200) {
          throw new Error(text);
        }
        throw new Error(`Geçersiz response formatı: ${text.substring(0, 100)}`);
      }
    } catch (parseError) {
      // Eğer response JSON değilse
      console.error('Response Parse Hatası:', parseError);
      console.error('Response Status:', response.status);
      console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(parseError.message || 'Geçersiz response formatı');
    }

    // HTTP status code kontrolü
    if (!response.ok) {
      // Token süresi dolmuşsa
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
      }

      // Backend'den gelen hata mesajını kullan
      // Eğer data.errors varsa (validation hataları), ilk hatayı göster
      let errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;

      // Validation hataları için daha detaylı mesaj
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors[0].message || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Backend'den success: false geldiyse de hata fırlat
    if (data && data.success === false) {
      throw new Error(data.message || 'İşlem başarısız');
    }

    return data;
  } catch (error) {
    console.error('API Hatası:', error);
    console.error('Endpoint:', endpoint);
    console.error('Options:', options);
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getProfile: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Ranking API
export const rankingAPI = {
  getRankings: () => apiRequest('/ranking'),
  getSiteAverage: () => apiRequest('/ranking/average'),
};

// Exam API
export const examAPI = {
  // Public (token gerektirmez)
  getPublicExams: async () => {
    try {
      // Public endpoint için token olmadan istek yap
      // Cache-busting için timestamp ekle
      const timestamp = new Date().getTime();
      const url = `${API_BASE_URL}/exams/public/list?t=${timestamp}`;
      console.log('🌐 API çağrısı yapılıyor:', url);
      console.log('🌐 API Base URL:', API_BASE_URL);

      let response;
      try {
        response = await fetch(url, {
          cache: 'no-cache',
          method: 'GET',
          mode: 'cors', // CORS modunu açıkça belirt
          credentials: 'omit', // Cookie gönderme
          headers: {
            'Accept': 'application/json',
          },
        });
      } catch (fetchError) {
        // Network hatası (backend çalışmıyor veya CORS sorunu)
        console.error('❌ Fetch hatası:', fetchError);
        console.error('❌ Hata tipi:', fetchError.name);
        console.error('❌ Hata mesajı:', fetchError.message);
        console.error('❌ Stack:', fetchError.stack);

        // CORS hatası mı kontrol et
        if (fetchError.message && (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
          throw new Error(`Bağlantı hatası. Backend'in çalıştığından emin olun: ${API_BASE_URL.replace('/api', '')}`);
        }

        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || 'İşlem başarısız');
      }

      console.log('✅ getPublicExams başarılı:', data);
      return data;
    } catch (error) {
      console.error('❌ getPublicExams API hatası:', error);
      console.error('API Base URL:', API_BASE_URL);
      throw error;
    }
  },

  // Protected
  getExams: () => apiRequest('/exams'),
  getExam: (id) => apiRequest(`/exams/${id}`),
  getTopics: (examId) => apiRequest(`/exams/topics/list?examId=${examId || ''}`),
  getTopic: (id) => apiRequest(`/exams/topics/${id}`),
  getArticles: (topicId) => apiRequest(`/exams/articles/list?topicId=${topicId}`),
  getSummaries: (topicId) => apiRequest(`/exams/summaries/list?topicId=${topicId}`),

  // Admin: Topic CRUD
  createTopic: (data) => apiRequest('/exams/topics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTopic: (id, data) => apiRequest(`/exams/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTopic: (id) => apiRequest(`/exams/topics/${id}`, {
    method: 'DELETE',
  }),

  // Admin: Article ve Summary
  createArticle: (data) => apiRequest('/exams/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateArticle: (id, data) => apiRequest(`/exams/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteArticle: (id) => apiRequest(`/exams/articles/${id}`, {
    method: 'DELETE',
  }),
  createSummary: (data) => apiRequest('/exams/summaries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSummary: (id, data) => apiRequest(`/exams/summaries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSummary: (id) => apiRequest(`/exams/summaries/${id}`, {
    method: 'DELETE',
  }),

  // Admin
  createExam: (data) => apiRequest('/exams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateExam: (id, data) => apiRequest(`/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteExam: (id) => apiRequest(`/exams/${id}`, {
    method: 'DELETE',
  }),
};

// Question API
export const questionAPI = {
  getQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/questions?${queryString}`);
  },
  getQuestion: (id) => apiRequest(`/questions/${id}`),
  getMixedQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/questions/mixed?${queryString}`);
  },
  reportQuestion: (data) => apiRequest('/questions/report', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin: Question CRUD
  createQuestion: (data) => apiRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateQuestion: (id, data) => apiRequest(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteQuestion: (id) => apiRequest(`/questions/${id}`, {
    method: 'DELETE',
  }),

  // Admin: Soru raporları
  getQuestionReports: (status) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/questions/reports/all${query}`);
  },
  updateReportStatus: (id, status) => apiRequest(`/questions/reports/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Result API
export const resultAPI = {
  saveResult: (data) => apiRequest('/results', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/results/stats?${queryString}`);
  },
  getTopicStats: () => apiRequest('/results/stats/topics'), // Günlük konu istatistikleri
  getAllTopicStats: () => apiRequest('/results/stats/topics/all'), // Tüm zamanlar konu istatistikleri
  resetStats: () => apiRequest('/results/stats', {
    method: 'DELETE',
  }),
};

// Package API
export const packageAPI = {
  // Kullanıcı endpoint'leri
  requestPackage: (examId, paymentInfo = null) => apiRequest('/packages/request', {
    method: 'POST',
    body: JSON.stringify({
      examId,
      ...(paymentInfo && { paymentInfo })
    }),
  }),
  getMyPackages: () => apiRequest('/packages/my-packages'),
  getMyActivePackage: () => apiRequest('/packages/my-active-package'),

  // Admin endpoint'leri
  getPendingPackages: () => apiRequest('/packages/pending'),
  getAllUserPackages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/packages/all?${queryString}`);
  },
  approvePackage: (packageId, data = {}) => apiRequest(`/packages/${packageId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  rejectPackage: (packageId, data = {}) => apiRequest(`/packages/${packageId}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  cancelPackage: (packageId, data = {}) => apiRequest(`/packages/${packageId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  assignPackageToUser: (data) => apiRequest('/packages/assign', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// User API (Admin only)
export const userAPI = {
  getAllUsers: () => apiRequest('/users'),
  getUser: (id) => apiRequest(`/users/${id}`),
  updateUser: (id, data) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
  toggleUserActive: (id) => apiRequest(`/users/${id}/toggle-active`, {
    method: 'PATCH',
  }),
};

// Footer API
export const footerAPI = {
  // Footer içeriğini getir
  getFooter: () => apiRequest('/footer'),

  // Footer içeriğini güncelle (Admin)
  updateFooter: (data) => apiRequest('/footer', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Gizlilik politikası getir
  getPrivacyPolicy: () => apiRequest('/footer/privacy'),

  // Kullanım koşulları getir
  getTerms: () => apiRequest('/footer/terms'),

  // Mesafeli satış sözleşmesi getir
  getMesafeliSatis: () => apiRequest('/footer/mesafeli-satis'),

  // Kişisel verilerin kullanılması ve işlenmesi getir
  getKisiselVeriler: () => apiRequest('/footer/kisisel-veriler'),

  // Üyelik sözleşmesi getir
  getUyelikSozlesmesi: () => apiRequest('/footer/uyelik-sozlesmesi'),
};

// Practice Exam API (Deneme Sınavı)
export const practiceExamAPI = {
  // Tüm deneme sınavlarını getir
  getPracticeExams: () => apiRequest('/practice-exams'),

  // Belirli bir sınava ait deneme sınavlarını getir (Admin)
  getPracticeExamsByExam: (examId) => apiRequest(`/practice-exams/exam/${examId}`),

  // Tek bir deneme sınavını getir
  getPracticeExam: (id) => apiRequest(`/practice-exams/${id}`),

  // Deneme sınavı oluştur (Admin)
  createPracticeExam: (data) => apiRequest('/practice-exams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Deneme sınavı güncelle (Admin)
  updatePracticeExam: (id, data) => apiRequest(`/practice-exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Deneme sınavı sil (Admin)
  deletePracticeExam: (id) => apiRequest(`/practice-exams/${id}`, {
    method: 'DELETE',
  }),

  // Deneme sınavı sonucunu kaydet
  submitPracticeExam: (id, data) => apiRequest(`/practice-exams/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Kullanıcının deneme sınavı sonuçlarını getir
  getPracticeExamResults: (id) => apiRequest(`/practice-exams/${id}/results`),

  // Tek bir sonucu detaylı getir (sorularla birlikte)
  getPracticeExamResultDetail: (resultId) => apiRequest(`/practice-exams/results/${resultId}`),
};

// Hero Slide API
export const heroSlideAPI = {
  getPublicSlides: () => apiRequest('/hero-slides/public'),
  getAllSlides: () => apiRequest('/hero-slides'),
  createSlide: (data) => apiRequest('/hero-slides', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSlide: (id, data) => apiRequest(`/hero-slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSlide: (id) => apiRequest(`/hero-slides/${id}`, {
    method: 'DELETE',
  }),
  reorderSlides: (slideIds) => apiRequest('/hero-slides/reorder', {
    method: 'PUT',
    body: JSON.stringify({ slideIds }),
  }),
};

// General Admin API
export const adminAPI = {
  getDashboardStats: () => apiRequest('/admin/dashboard-stats'),
};

// Utility functions
export { getToken, setToken, removeToken };

