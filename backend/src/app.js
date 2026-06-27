const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const categoryRoutes = require('./routes/category.routes');
const promotionRoutes = require('./routes/promotion.routes');
const adminRoutes = require('./routes/admin.routes');
const supplierRoutes = require('./routes/supplier.routes');

const app = express();

// ============================================================
// Securite et middlewares globaux
// ============================================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Limite globale anti-abus : 300 requetes / 15 minutes / IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Limite stricte sur les routes d'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives. Reessayez dans quelques minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Fichiers uploades (images/videos produits) servis statiquement
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ============================================================
// Routes API
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API FITAHIANTSOA operationnelle.', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/suppliers', supplierRoutes);

// ============================================================
// Gestion des erreurs (toujours en dernier)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
