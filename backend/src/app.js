import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ENV } from './config/env.js';

const app = express();

// Trust reverse proxies (Render, Railway, Heroku, AWS, Cloudflare)
app.set('trust proxy', 1);

// Security HTTP headers with cross-origin allowance
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false
}));

// CORS Configuration: Unconditionally allow all domains & credentials
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Enable pre-flight across all routes
app.options('*', cors());

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
