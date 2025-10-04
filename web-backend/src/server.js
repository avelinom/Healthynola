const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/customers');
const reportsRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backup');
const transfersRoutes = require('./routes/transfers');
const expensesRoutes = require('./routes/expenses');
const rawMaterialsRoutes = require('./routes/rawMaterials');
const recipesRoutes = require('./routes/recipes');
const batchesRoutes = require('./routes/batches');
const permissionsRoutes = require('./routes/permissions');
const categoriesRoutes = require('./routes/categories');
const packagingTypesRoutes = require('./routes/packagingTypes');
const warehousesRoutes = require('./routes/warehouses');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://192.168.68.104:3000',
      'http://192.168.68.104:3001',
      'https://healthynola.vercel.app',
      'https://healthynola-8kaxe5va4-andresamiguelez-projects.vercel.app'
    ],
    methods: ['GET', 'POST']
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://192.168.68.104:3000',
    'http://192.168.68.104:3001',
    'https://healthynola.vercel.app',
    'https://healthynola-8kaxe5va4-andresamiguelez-projects.vercel.app'
  ],
  credentials: true
}));

// Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/raw-materials', rawMaterialsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/packaging-types', packagingTypesRoutes);
app.use('/api/warehouses', warehousesRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces
server.listen(PORT, HOST, () => {
  logger.info(`🚀 Healthynola POS Backend running on ${HOST}:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`📱 Mobile access: http://192.168.68.104:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
