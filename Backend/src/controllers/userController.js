const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * Controller per gestione utenti
 */
class UserController {

  /**
   * Ottieni profilo utente
   */
  async getProfile(req, res) {
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

  /**
   * Aggiorna profilo utente
   */
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const allowedUpdates = ['name', 'bio', 'avatar', 'preferences'];
      const updates = {};

      // Filtra solo i campi consentiti
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Profilo aggiornato con successo',
        data: { user: user.toSafeObject() }
      });

    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Cambia password
   */
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Trova utente con password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica password corrente
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password corrente non valida'
        });
      }

      // Aggiorna password
      user.password = newPassword;
      await user.save();

      // Revoca tutti i refresh tokens per forzare nuovo login
      user.refreshTokens = [];
      await user.save();

      res.json({
        success: true,
        message: 'Password cambiata con successo. Effettua nuovo login.'
      });

    } catch (error) {
      console.error('Errore cambio password:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna preferenze utente
   */
  async updatePreferences(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { preferences } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Preferenze aggiornate con successo',
        data: { user: user.toSafeObject() }
      });

    } catch (error) {
      console.error('Errore aggiornamento preferenze:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina account utente
   */
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.userId;

      // Trova utente con password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password non valida'
        });
      }

      // Elimina tutti i dati associati all'utente
      await Promise.all([
        require('../models/Task').deleteMany({ userId }),
        require('../models/Note').deleteMany({ userId }),
        require('../models/Goal').deleteMany({ userId }),
        require('../models/Project').deleteMany({ userId })
      ]);

      // Elimina utente
      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'Account eliminato con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione account:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni statistiche utente
   */
  async getUserStats(req, res) {
    try {
      const userId = req.user.userId;

      const [taskStats, noteStats, goalStats, projectStats] = await Promise.all([
        require('../models/Task').aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        require('../models/Note').countDocuments({ userId, isArchived: false }),
        require('../models/Goal').aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        require('../models/Project').countDocuments({ userId })
      ]);

      const stats = {
        tasks: {
          total: taskStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: taskStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        notes: {
          total: noteStats
        },
        goals: {
          total: goalStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: goalStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        projects: {
          total: projectStats
        }
      };

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Errore statistiche utente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new UserController();const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * Controller per gestione utenti
 */
class UserController {

  /**
   * Ottieni profilo utente
   */
  async getProfile(req, res) {
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

  /**
   * Aggiorna profilo utente
   */
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const allowedUpdates = ['name', 'bio', 'avatar', 'preferences'];
      const updates = {};

      // Filtra solo i campi consentiti
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Profilo aggiornato con successo',
        data: { user: user.toSafeObject() }
      });

    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Cambia password
   */
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Trova utente con password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica password corrente
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password corrente non valida'
        });
      }

      // Aggiorna password
      user.password = newPassword;
      await user.save();

      // Revoca tutti i refresh tokens per forzare nuovo login
      user.refreshTokens = [];
      await user.save();

      res.json({
        success: true,
        message: 'Password cambiata con successo. Effettua nuovo login.'
      });

    } catch (error) {
      console.error('Errore cambio password:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna preferenze utente
   */
  async updatePreferences(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { preferences } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Preferenze aggiornate con successo',
        data: { user: user.toSafeObject() }
      });

    } catch (error) {
      console.error('Errore aggiornamento preferenze:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina account utente
   */
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.userId;

      // Trova utente con password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password non valida'
        });
      }

      // Elimina tutti i dati associati all'utente
      await Promise.all([
        require('../models/Task').deleteMany({ userId }),
        require('../models/Note').deleteMany({ userId }),
        require('../models/Goal').deleteMany({ userId }),
        require('../models/Project').deleteMany({ userId })
      ]);

      // Elimina utente
      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'Account eliminato con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione account:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni statistiche utente
   */
  async getUserStats(req, res) {
    try {
      const userId = req.user.userId;

      const [taskStats, noteStats, goalStats, projectStats] = await Promise.all([
        require('../models/Task').aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        require('../models/Note').countDocuments({ userId, isArchived: false }),
        require('../models/Goal').aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        require('../models/Project').countDocuments({ userId })
      ]);

      const stats = {
        tasks: {
          total: taskStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: taskStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        notes: {
          total: noteStats
        },
        goals: {
          total: goalStats.reduce((sum, stat) => sum + stat.count, 0),
          byStatus: goalStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        projects: {
          total: projectStats
        }
      };

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Errore statistiche utente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new UserController();
