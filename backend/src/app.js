import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ENV } from './config/env.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: true, // Allow frontend dev server and production domains
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with 10mb payload limit for documents
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'ProcureAI Enterprise Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Router
app.use('/api', apiRoutes);

// 404 handler for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error middleware
app.use(errorHandler);

export default app;
