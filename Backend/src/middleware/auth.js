const jwtConfig = require('../config/jwt');
const User = require('../models/User');

/**
 * Middleware per autenticazione JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token di accesso mancante'
      });
    }

    const token = authHeader.substring(7); // Rimuovi 'Bearer '

    try {
      const decoded = jwtConfig.verifyToken(token);
      
      // Verifica che l'utente esista ancora
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token non valido'
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token non valido'
      });
    }

  } catch (error) {
    console.error('Errore middleware auth:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
};

/**
 * Middleware per autorizzazione basata su ruoli (opzionale)
 */
const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accesso negato'
        });
      }

      next();
    } catch (error) {
      console.error('Errore middleware authorize:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  };
};

module.exports = { authMiddleware, authorize };
