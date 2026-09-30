import app from './app.js';
import { ENV } from './config/env.js';

// Enterprise Backend Server with Supabase & Resilient Fallback
let PORT = parseInt(process.env.PORT, 10) || parseInt(ENV.PORT, 10) || 5000;
const HOST = '0.0.0.0';

function startServer(port, attempts = 0) {
  const server = app.listen(port, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ProcureAI Enterprise Backend running on ${HOST}:${port}`);
    console.log(`🌐 Health check: http://${HOST}:${port}/api/health`);
    console.log(`⚙️  Environment: ${ENV.NODE_ENV}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempts < 15) {
        console.warn(`⚠️  [Port Notice] Port ${port} is occupied. Retrying on port ${port + 1}...`);
        startServer(port + 1, attempts + 1);
      } else {
        console.error(`❌ [Port Conflict] Unable to bind to ports ${PORT}-${port}. Exiting process.`);
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
