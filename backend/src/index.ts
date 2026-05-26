import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

// Load variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middlewares
app.use(cors({
  origin: '*', // Allows broad connection for clean developer testing
  credentials: true
}));
app.use(express.json());

// Main Router Endpoint
app.use('/api', apiRouter);

// Base Root Route to prevent "Cannot GET /"
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    message: 'Welcome to Aetheris Ads Analytics API Engine.',
    frontend_url: 'http://localhost:3000',
    api_documentation: 'http://localhost:5000/health'
  });
});

// Base Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Aetheris Express API Server'
  });
});

// Global Fallback Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Aetheris Server Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start listening
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 AETHERIS BACKEND SERVER RUNNING ON PORT: ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log('====================================================');
});
