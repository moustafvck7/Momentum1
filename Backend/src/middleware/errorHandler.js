/**
 * Middleware per gestione errori centralizzata
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error Details:', err);

  // Errori di validazione Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Errore chiave duplicata Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} già esistente`;
    error.message = message;
    error.statusCode = 409;
  }

  // Errore cast Mongoose (ID non valido)
  if (err.name === 'CastError') {
    const message = 'Risorsa non trovata';
    error.message = message;
    error.statusCode = 404;
  }

  // Errori JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token non valido';
    error.message = message;
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token scaduto';
    error.message = message;
    error.statusCode = 401;
  }

  // Errori di Multer (upload file)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File troppo grande';
    error.message = message;
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Troppi file caricati';
    error.message = message;
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Tipo di file non supportato';
    error.message = message;
    error.statusCode = 400;
  }

  // Errori di Rate Limiting
  if (err.status === 429) {
    const message = 'Troppe richieste, riprova più tardi';
    error.message = message;
    error.statusCode = 429;
  }

  // Errori di SyntaxError (JSON malformato)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Formato JSON non valido';
    error.message = message;
    error.statusCode = 400;
  }

  // Errori di connessione MongoDB
  if (err.name === 'MongoNetworkError') {
    const message = 'Errore di connessione al database';
    error.message = message;
    error.statusCode = 503;
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Timeout connessione database';
    error.message = message;
    error.statusCode = 503;
  }

  // Log errori in produzione per debugging
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    // Qui puoi integrare servizi di logging come Sentry, LogRocket, etc.
    console.error('Production Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
      timestamp: new Date().toISOString()
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err
    })
  });
};

/**
 * Middleware per gestire rotte non trovate
 */
const notFound = (req, res, next) => {
  const error = new Error(`Rotta ${req.originalUrl} non trovata`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware per logging errori async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware per validazione errori di express-validator
 */
const validationErrorHandler = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dati non validi',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Middleware per gestione timeout richieste
 */
const timeoutHandler = (timeout = 30000) => (req, res, next) => {
  res.setTimeout(timeout, () => {
    const error = new Error('Timeout richiesta');
    error.statusCode = 408;
    next(error);
  });
  next();
};

module.exports = { 
  errorHandler, 
  notFound, 
  asyncHandler, 
  validationErrorHandler,
  timeoutHandler 
};