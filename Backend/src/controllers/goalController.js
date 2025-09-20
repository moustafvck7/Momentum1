const Goal = require('../models/Goal');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Controller per gestione obiettivi
 */
class GoalController {

  /**
   * Ottieni tutti gli obiettivi dell'utente
   */
  async getGoals(req, res) {
    try {
      const userId = req.user.userId;
      const {
        status,
        category,
        priority,
        search,
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Costruisci filtro
      const filter = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Opzioni paginazione
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Esegui query
      const [goals, total] = await Promise.all([
        Goal.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Goal.countDocuments(filter)
      ]);

      // Statistiche
      const stats = await Goal.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { 
              $avg: {
                $cond: [
                  { $eq: ['$targetValue', 0] },
                  0,
                  { $multiply: [{ $divide: ['$currentValue', '$targetValue'] }, 100] }
                ]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          goals,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          },
          stats
        }
      });

    } catch (error) {
      console.error('Errore recupero obiettivi:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni obiettivo per ID
   */
  async getGoal(req, res) {
    try {
      const { goalId } = req.params;
      const userId = req.user.userId;

      const goal = await Goal.findOne({ _id: goalId, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      res.json({
        success: true,
        data: { goal }
      });

    } catch (error) {
      console.error('Errore recupero obiettivo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Crea nuovo obiettivo
   */
  async createGoal(req, res) {
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
      const goalData = { ...req.body, userId };

      const goal = new Goal(goalData);
      await goal.save();

      res.status(201).json({
        success: true,
        message: 'Obiettivo creato con successo',
        data: { goal }
      });

    } catch (error) {
      console.error('Errore creazione obiettivo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna obiettivo
   */
  async updateGoal(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { goalId } = req.params;
      const userId = req.user.userId;

      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Obiettivo aggiornato con successo',
        data: { goal }
      });

    } catch (error) {
      console.error('Errore aggiornamento obiettivo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna progresso obiettivo
   */
  async updateProgress(req, res) {
    try {
      const { goalId } = req.params;
      const { currentValue, increment } = req.body;
      const userId = req.user.userId;

      const goal = await Goal.findOne({ _id: goalId, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      // Aggiorna valore corrente
      if (currentValue !== undefined) {
        goal.currentValue = Math.max(0, Math.min(currentValue, goal.targetValue));
      } else if (increment !== undefined) {
        goal.currentValue = Math.max(0, Math.min(goal.currentValue + increment, goal.targetValue));
      }

      // Verifica se obiettivo è completato
      if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
        goal.status = 'completed';
        goal.completedAt = new Date();
      }

      await goal.save();

      res.json({
        success: true,
        message: 'Progresso aggiornato con successo',
        data: { goal }
      });

    } catch (error) {
      console.error('Errore aggiornamento progresso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina obiettivo
   */
  async deleteGoal(req, res) {
    try {
      const { goalId } = req.params;
      const userId = req.user.userId;

      const goal = await Goal.findOneAndDelete({ _id: goalId, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Obiettivo eliminato con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione obiettivo:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiungi milestone
   */
  async addMilestone(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { goalId } = req.params;
      const userId = req.user.userId;
      const milestoneData = req.body;

      const goal = await Goal.findOne({ _id: goalId, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      goal.milestones.push(milestoneData);
      await goal.save();

      res.status(201).json({
        success: true,
        message: 'Milestone aggiunta con successo',
        data: { goal }
      });

    } catch (error) {
      console.error('Errore aggiunta milestone:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Completa milestone
   */
  async completeMilestone(req, res) {
    try {
      const { goalId, milestoneId } = req.params;
      const userId = req.user.userId;

      const goal = await Goal.findOne({ _id: goalId, userId });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Obiettivo non trovato'
        });
      }

      const milestone = goal.milestones.id(milestoneId);
      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone non trovata'
        });
      }

      milestone.completed = !milestone.completed;
      milestone.completedAt = milestone.completed ? new Date() : undefined;

      await goal.save();

      res.json({
        success: true,
        message: milestone.completed ? 'Milestone completata' : 'Milestone riattivata',
        data: { goal }
      });

    } catch (error) {
      console.error('Errore completamento milestone:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new GoalController();