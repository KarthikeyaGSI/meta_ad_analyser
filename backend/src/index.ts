import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import apiRouter from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// API router
app.use('/api', apiRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    message: 'Welcome to Vero Ads Analytics API Engine.',
    frontend_url: 'http://localhost:3000',
    api_documentation: 'http://localhost:5000/health',
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Vero Express API Server',
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Vero Server Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Start server only when run directly (prevents listening during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 VERO BACKEND SERVER RUNNING ON PORT: ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log('====================================================');
  });
}

export default app;
