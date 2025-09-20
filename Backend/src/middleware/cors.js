const cors = require('cors');

/**
 * Configurazione CORS personalizzata
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Lista dei domini autorizzati
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001', // Per sviluppo
      'https://momentum-app.vercel.app', // Per produzione
      // Aggiungi altri domini autorizzati qui
    ];

    // Permetti richieste senza origin (es. app mobile, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorizzato da CORS policy'));
    }
  },
  credentials: true, // Permetti cookies e headers di autenticazione
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count'
  ],
  optionsSuccessStatus: 200, // Per supportare browser legacy
  maxAge: 86400 // Cache preflight per 24 ore
};

/**
 * Middleware CORS configurato
 */
const corsMiddleware = cors(corsOptions);

/**
 * Middleware CORS per sviluppo (più permissivo)
 */
const devCorsMiddleware = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*'
});

module.exports = {
  corsMiddleware,
  devCorsMiddleware,
  corsOptions
};