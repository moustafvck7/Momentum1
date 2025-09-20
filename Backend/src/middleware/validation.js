const { body, param, query } = require('express-validator');

/**
 * Validatori per l'autenticazione
 */
const authValidators = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve essere tra 2 e 50 caratteri'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email non valida'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password deve essere almeno 6 caratteri')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password deve contenere almeno una lettera minuscola, maiuscola e un numero')
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email non valida'),
    body('password')
      .notEmpty()
      .withMessage('Password è obbligatoria')
  ],
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token è obbligatorio')
  ]
};

/**
 * Validatori per le tasks
 */
const taskValidators = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Titolo deve essere tra 1 e 200 caratteri'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrizione non può superare 1000 caratteri'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priorità non valida'),
    body('category')
      .isIn(['work', 'personal', 'health', 'learning', 'other'])
      .withMessage('Categoria non valida'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Data scadenza non valida'),
    body('estimatedDuration')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('Durata stimata deve essere tra 1 e 1440 minuti')
  ],
  update: [
    param('taskId')
      .isMongoId()
      .withMessage('ID task non valido'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Titolo deve essere tra 1 e 200 caratteri'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Descrizione non può superare 1000 caratteri'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Status non valido'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priorità non valida'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Data scadenza non valida')
  ],
  getById: [
    param('taskId')
      .isMongoId()
      .withMessage('ID task non valido')
  ],
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Numero pagina deve essere >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve essere tra 1 e 100'),
    query('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Status non valido'),
    query('category')
      .optional()
      .isIn(['work', 'personal', 'health', 'learning', 'other'])
      .withMessage('Categoria non valida'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priorità non valida')
  ]
};

/**
 * Validatori per le note
 */
const noteValidators = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Titolo deve essere tra 1 e 200 caratteri'),
    body('content')
      .optional()
      .isLength({ max: 50000 })
      .withMessage('Contenuto non può superare 50000 caratteri'),
    body('category')
      .optional()
      .isIn(['work', 'personal', 'ideas', 'other'])
      .withMessage('Categoria non valida'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags deve essere un array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Ogni tag deve essere tra 1 e 30 caratteri')
  ]
};

/**
 * Validatori per i progetti
 */
const projectValidators = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Titolo deve essere tra 1 e 200 caratteri'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Descrizione non può superare 2000 caratteri'),
    body('category')
      .isIn(['cv', 'tech', 'creativity', 'other'])
      .withMessage('Categoria non valida'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Colore deve essere un hex valido')
  ]
};

module.exports = {
  authValidators,
  taskValidators,
  noteValidators,
  projectValidators
};

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

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware per gestire rotte non trovate
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rotta ${req.originalUrl} non trovata`
  });
};

module.exports = { errorHandler, notFound };
