import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const APP_URL = process.env.APP_URL || '';

const app = express();

// Trust reverse proxies (Cloud Run, Cloudflare, NGINX) to accurately evaluate client IPs in rate limiters
app.set('trust proxy', 1);

// Disable the X-Powered-By header to prevent fingerprinting
app.disable('x-powered-by');

// =============================================================================
// 1. SECURITY HEADERS (Helmet)
// =============================================================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Vite inline scripts and Google Identity Services
          'https://apis.google.com',
          'https://accounts.google.com',
          'https://www.gstatic.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Tailwind & CSS-in-JS styles
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://images.unsplash.com',
          'https://lh3.googleusercontent.com',
          'https://firebasestorage.googleapis.com',
        ],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://*.firebaseio.com',
          'https://identitytoolkit.googleapis.com',
          'https://securetoken.googleapis.com',
          'https://firestore.googleapis.com',
          'wss://*.firebaseio.com',
          'https://sheetdb.io',
          'https://script.google.com',
        ],
        frameSrc: [
          "'self'",
          'https://accounts.google.com',
          'https://*.firebaseapp.com',
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Allows cross-origin images (e.g. Unsplash)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Required for Google OAuth Popups
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// =============================================================================
// 2. CORS (Cross-Origin Resource Sharing)
// =============================================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [APP_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // Check against allowed whitelist or Cloud Run preview domains
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.run\.app$/.test(new URL(origin).hostname) ||
      !isProduction;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Policy: Origin ${origin} not permitted`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400, // Preflight cache for 24 hours
};

app.use(cors(corsOptions));

// =============================================================================
// 3. RATE LIMITING (DDoS & Brute-Force Protection)
// =============================================================================

// Standard API rate limiter: max 120 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Strict rate limiter for sensitive endpoints (Authentication, Recruit Applications, Submissions)
// Max 10 requests per 15 minutes per IP
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'High request frequency detected on sensitive endpoint. Access temporarily throttled.',
  },
});

// =============================================================================
// 4. REQUEST BODY PARSER LIMITS (DoS / Memory Exhaustion Protection)
// =============================================================================
// Restrict incoming JSON & URL-encoded payloads to 100kb to prevent payload bombing attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Apply rate limiter to all /api routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// =============================================================================
// 5. SERVER ENTRY & VITE INTEGRATION
// =============================================================================
async function startServer() {
  if (!isProduction) {
    // In development: dynamically load and attach Vite dev middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built static files with caching
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        index: false,
      })
    );

    // Fallback to index.html for React Router SPA
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[SERVER ERROR]:', err.message || err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: isProduction ? 'An unexpected server error occurred.' : err.message,
    });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MU BNCC PORTAL] Server listening securely on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[MU BNCC PORTAL] Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[FATAL STARTUP ERROR]:', err);
  process.exit(1);
});

export default app;
