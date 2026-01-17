// UzmanGYS Platform - Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');
const { helmetConfig, corsOptions } = require('./src/config/security');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const examRoutes = require('./src/routes/examRoutes');
const resultRoutes = require('./src/routes/resultRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const userRoutes = require('./src/routes/userRoutes');
const footerRoutes = require('./src/routes/footerRoutes');
const practiceExamRoutes = require('./src/routes/practiceExamRoutes');
const rankingRoutes = require('./src/routes/rankingRoutes');
const heroSlideRoutes = require('./src/routes/heroSlideRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'UzmanGYS API çalışıyor',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/practice-exams', practiceExamRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/admin', require('./src/routes/adminRoutes'));

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Server başlat
async function startServer() {
  try {
    // Veritabanı bağlantısı
    await connectDB();

    // Server'ı dinle
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor`);
      console.log(`📚 UzmanGYS Platform API`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server başlatılamadı:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
// Trigger deploy
