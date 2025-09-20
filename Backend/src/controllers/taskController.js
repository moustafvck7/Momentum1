const Task = require('../models/Task');
const { validationResult } = require('express-validator');

/**
 * Controller per gestione tasks
 */
class TaskController {

  /**
   * Ottieni tutte le tasks dell'utente
   */
  async getTasks(req, res) {
    try {
      const userId = req.user.userId;
      const {
        status,
        category,
        priority,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Costruisci filtro
      const filter = { userId };
      
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
      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('projectId', 'title color'),
        Task.countDocuments(filter)
      ]);

      // Calcola statistiche
      const stats = await Task.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusStats = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        statusStats[stat._id] = stat.count;
      });

      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          },
          stats: statusStats
        }
      });

    } catch (error) {
      console.error('Errore recupero tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni task per ID
   */
  async getTask(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      const task = await Task.findOne({ _id: taskId, userId })
        .populate('projectId', 'title color');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task non trovata'
        });
      }

      res.json({
        success: true,
        data: { task }
      });

    } catch (error) {
      console.error('Errore recupero task:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Crea nuova task
   */
  async createTask(req, res) {
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
      const taskData = { ...req.body, userId };

      const task = new Task(taskData);
      await task.save();

      res.status(201).json({
        success: true,
        message: 'Task creata con successo',
        data: { task }
      });

    } catch (error) {
      console.error('Errore creazione task:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna task
   */
  async updateTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { taskId } = req.params;
      const userId = req.user.userId;

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        req.body,
        { new: true, runValidators: true }
      ).populate('projectId', 'title color');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Task aggiornata con successo',
        data: { task }
      });

    } catch (error) {
      console.error('Errore aggiornamento task:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina task
   */
  async deleteTask(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      const task = await Task.findOneAndDelete({ _id: taskId, userId });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Task eliminata con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione task:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna stato task
   */
  async updateTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status non valido'
        });
      }

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { status },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Status task aggiornato con successo',
        data: { task }
      });

    } catch (error) {
      console.error('Errore aggiornamento status task:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni statistiche tasks
   */
  async getTaskStats(req, res) {
    try {
      const userId = req.user.userId;
      const { period = '7d' } = req.query;

      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const stats = await Task.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              status: '$status',
              category: '$category',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            count: { $sum: 1 },
            totalDuration: { $sum: '$actualDuration' }
          }
        },
        {
          $group: {
            _id: null,
            byStatus: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            byCategory: {
              $push: {
                category: '$_id.category',
                count: '$count'
              }
            },
            byDate: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            },
            totalTasks: { $sum: '$count' },
            totalDuration: { $sum: '$totalDuration' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          stats: stats[0] || {
            byStatus: [],
            byCategory: [],
            byDate: [],
            totalTasks: 0,
            totalDuration: 0
          }
        }
      });

    } catch (error) {
      console.error('Errore statistiche tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new TaskController();
