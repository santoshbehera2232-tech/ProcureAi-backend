import app from './app.js';
import { ENV } from './config/env.js';

// Enterprise Backend Server with Supabase & Resilient Fallback
let PORT = parseInt(ENV.PORT, 10) || 5000;

function startServer(port, attempts = 0) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ProcureAI Enterprise Backend running on port ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/api/health`);
    console.log(`⚙️  Environment: ${ENV.NODE_ENV}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempts < 3) {
        console.warn(`⚠️  [Port Notice] Port ${port} is occupied. Automatically retrying on port ${port + 1}...`);
        startServer(port + 1, attempts + 1);
      } else {
        console.error(`❌ [Port Conflict] Unable to bind to ports ${PORT}-${port}. Please free port ${PORT}.`);
        process.exit(1);
      }
    } else {
      console.error('[Server Error]', err);
    }
  });

  // Graceful shutdown handling
  const cleanExit = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', cleanExit);
  process.on('SIGINT', cleanExit);
}

startServer(PORT);
