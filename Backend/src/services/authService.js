const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const emailService = require('./emailService');

/**
 * Servizi per gestione autenticazione e sicurezza
 */
class AuthService {

  /**
   * Genera token di verifica email
   * @param {string} userId - ID dell'utente
   * @returns {string} Token di verifica
   */
  generateEmailVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hashedToken };
  }

  /**
   * Genera token di reset password
   * @param {string} userId - ID dell'utente
   * @returns {Object} Token e data scadenza
   */
  generatePasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minuti
    
    return { token, hashedToken, expiresAt };
  }

  /**
   * Invia email di verifica account
   * @param {Object} user - Utente
   * @param {string} token - Token di verifica
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const emailData = {
      to: user.email,
      subject: 'Verifica il tuo account Momentum',
      template: 'verification',
      context: {
        name: user.name,
        verificationUrl,
        appName: 'Momentum'
      }
    };

    await emailService.sendEmail(emailData);
  }

  /**
   * Invia email di reset password
   * @param {Object} user - Utente
   * @param {string} token - Token di reset
   */
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const emailData = {
      to: user.email,
      subject: 'Reset della password - Momentum',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl,
        appName: 'Momentum',
        expiresIn: '10 minuti'
      }
    };

    await emailService.sendEmail(emailData);
  }

  /**
   * Verifica email utente
   * @param {string} token - Token di verifica
   * @returns {Object} Risultato verifica
   */
  async verifyEmail(token) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        isEmailVerified: false
      });

      if (!user) {
        return {
          success: false,
          message: 'Token di verifica non valido o scaduto'
        };
      }

      // Aggiorna utente
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verificata con successo',
        user: user.toSafeObject()
      };

    } catch (error) {
      throw new Error('Errore durante la verifica email');
    }
  }

  /**
   * Inizia processo reset password
   * @param {string} email - Email utente
   * @returns {Object} Risultato operazione
   */
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Per sicurezza, non rivelare se l'email esiste
        return {
          success: true,
          message: 'Se l\'email esiste, riceverai le istruzioni per il reset'
        };
      }

      // Genera token
      const { token, hashedToken, expiresAt } = this.generatePasswordResetToken(user._id);
      
      // Salva token nel database
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = expiresAt;
      await user.save();

      // Invia email
      await this.sendPasswordResetEmail(user, token);

      return {
        success: true,
        message: 'Email di reset inviata con successo'
      };

    } catch (error) {
      throw new Error('Errore durante la richiesta di reset password');
    }
  }

  /**
   * Reset password con token
   * @param {string} token - Token di reset
   * @param {string} newPassword - Nuova password
   * @returns {Object} Risultato operazione
   */
  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      }).select('+password');

      if (!user) {
        return {
          success: false,
          message: 'Token di reset non valido o scaduto'
        };
      }

      // Aggiorna password
      user.password = newPassword; // Il middleware pre-save farà l'hash
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // Invalida tutti i refresh tokens
      await user.save();

      return {
        success: true,
        message: 'Password aggiornata con successo'
      };

    } catch (error) {
      throw new Error('Errore durante il reset della password');
    }
  }

  /**
   * Cambia password (utente autenticato)
   * @param {string} userId - ID utente
   * @param {string} currentPassword - Password corrente
   * @param {string} newPassword - Nuova password
   * @returns {Object} Risultato operazione
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return {
          success: false,
          message: 'Utente non trovato'
        };
      }

      // Verifica password corrente
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Password corrente non corretta'
        };
      }

      // Aggiorna password
      user.password = newPassword;
      user.refreshTokens = []; // Invalida tutti i refresh tokens
      await user.save();

      return {
        success: true,
        message: 'Password cambiata con successo'
      };

    } catch (error) {
      throw new Error('Errore durante il cambio password');
    }
  }

  /**
   * Controlla la forza della password
   * @param {string} password - Password da controllare
   * @returns {Object} Risultato valutazione
   */
  checkPasswordStrength(password) {
    const result = {
      score: 0,
      feedback: [],
      isStrong: false
    };

    // Lunghezza minima
    if (password.length >= 8) {
      result.score += 1;
    } else {
      result.feedback.push('Password deve essere almeno 8 caratteri');
    }

    // Lettere minuscole
    if (/[a-z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Aggiungi lettere minuscole');
    }

    // Lettere maiuscole
    if (/[A-Z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Aggiungi lettere maiuscole');
    }

    // Numeri
    if (/\d/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Aggiungi numeri');
    }

    // Caratteri speciali
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Aggiungi caratteri speciali');
    }

    // Password lunghe bonus
    if (password.length >= 12) {
      result.score += 1;
    }

    result.isStrong = result.score >= 4;
    
    return result;
  }

  /**
   * Pulisce refresh tokens scaduti
   * @param {string} userId - ID utente (opzionale)
   */
  async cleanupExpiredTokens(userId = null) {
    try {
      const query = userId ? { _id: userId } : {};
      
      await User.updateMany(query, {
        $pull: {
          refreshTokens: {
            expiresAt: { $lte: new Date() }
          }
        }
      });

    } catch (error) {
      console.error('Errore pulizia tokens scaduti:', error);
    }
  }

  /**
   * Ottieni sessioni attive utente
   * @param {string} userId - ID utente
   * @returns {Array} Lista sessioni
   */
  async getActiveSessions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      return user.refreshTokens
        .filter(token => token.expiresAt > new Date())
        .map(token => ({
          id: token._id,
          createdAt: token.createdAt,
          expiresAt: token.expiresAt
        }));

    } catch (error) {
      throw new Error('Errore recupero sessioni attive');
    }
  }

  /**
   * Revoca sessione specifica
   * @param {string} userId - ID utente
   * @param {string} sessionId - ID sessione
   */
  async revokeSession(userId, sessionId) {
    try {
      await User.updateOne(
        { _id: userId },
        { $pull: { refreshTokens: { _id: sessionId } } }
      );

    } catch (error) {
      throw new Error('Errore revoca sessione');
    }
  }

  /**
   * Revoca tutte le sessioni utente
   * @param {string} userId - ID utente
   */
  async revokeAllSessions(userId) {
    try {
      await User.updateOne(
        { _id: userId },
        { $set: { refreshTokens: [] } }
      );

    } catch (error) {
      throw new Error('Errore revoca tutte le sessioni');
    }
  }
}

module.exports = new AuthService();
