const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { validationResult } = require('express-validator');

/**
 * Controller per gestione autenticazione
 */
class AuthController {

  /**
   * Registrazione nuovo utente
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Verifica se utente esiste già
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email già registrata'
        });
      }

      // Crea nuovo utente
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // Genera tokens
      const accessToken = jwtConfig.generateToken({ userId: user._id });
      const refreshToken = jwtConfig.generateRefreshToken({ userId: user._id });

      // Salva refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni
      });
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Utente registrato con successo',
        data: {
          user: user.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Errore registrazione:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Login utente
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Trova utente e includi password per la verifica
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      // Verifica password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      // Aggiorna ultimo login
      user.lastLoginAt = new Date();

      // Genera tokens
      const accessToken = jwtConfig.generateToken({ userId: user._id });
      const refreshToken = jwtConfig.generateRefreshToken({ userId: user._id });

      // Salva refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Rimuovi refresh tokens scaduti
      user.refreshTokens = user.refreshTokens.filter(
        token => token.expiresAt > new Date()
      );

      await user.save();

      res.json({
        success: true,
        message: 'Login effettuato con successo',
        data: {
          user: user.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Errore login:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Logout utente
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.userId;

      if (refreshToken) {
        // Rimuovi il refresh token specifico
        await User.updateOne(
          { _id: userId },
          { $pull: { refreshTokens: { token: refreshToken } } }
        );
      } else {
        // Rimuovi tutti i refresh tokens dell'utente
        await User.updateOne(
          { _id: userId },
          { $set: { refreshTokens: [] } }
        );
      }

      res.json({
        success: true,
        message: 'Logout effettuato con successo'
      });

    } catch (error) {
      console.error('Errore logout:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token mancante'
        });
      }

      // Verifica refresh token
      const decoded = jwtConfig.verifyRefreshToken(refreshToken);
      
      // Trova utente e verifica che il token esista
      const user = await User.findOne({
        _id: decoded.userId,
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token non valido'
        });
      }

      // Genera nuovo access token
      const newAccessToken = jwtConfig.generateToken({ userId: user._id });

      res.json({
        success: true,
        message: 'Token refreshato con successo',
        data: {
          accessToken: newAccessToken
        }
      });

    } catch (error) {
      console.error('Errore refresh token:', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token non valido'
      });
    }
  }

  /**
   * Profilo utente corrente
   */
  async me(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        data: { user: user.toSafeObject() }
      });

    } catch (error) {
      console.error('Errore recupero profilo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new AuthController();
