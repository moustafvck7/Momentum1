const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Controller per gestione progetti
 */
class ProjectController {

  /**
   * Ottieni tutti i progetti dell'utente
   */
  async getProjects(req, res) {
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

      // Esegui query con populate virtuale per task count
      const [projects, total] = await Promise.all([
        Project.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('taskCount'),
        Project.countDocuments(filter)
      ]);

      // Statistiche per categoria
      const categoryStats = await Project.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          },
          categoryStats
        }
      });

    } catch (error) {
      console.error('Errore recupero progetti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni progetto per ID
   */
  async getProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.userId;

      const project = await Project.findOne({ _id: projectId, userId })
        .populate('collaborators.userId', 'name email avatar')
        .populate('taskCount');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      // Ottieni tasks associate al progetto
      const tasks = await require('../models/Task').find({ 
        projectId, 
        userId 
      }).limit(10).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { 
          project,
          recentTasks: tasks
        }
      });

    } catch (error) {
      console.error('Errore recupero progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Crea nuovo progetto
   */
  async createProject(req, res) {
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
      const projectData = { ...req.body, userId };

      const project = new Project(projectData);
      await project.save();

      res.status(201).json({
        success: true,
        message: 'Progetto creato con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore creazione progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna progetto
   */
  async updateProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { projectId } = req.params;
      const userId = req.user.userId;

      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Progetto aggiornato con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore aggiornamento progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina progetto
   */
  async deleteProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.userId;

      const project = await Project.findOneAndDelete({ _id: projectId, userId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      // Rimuovi associazione progetto dalle tasks (opzionale)
      await require('../models/Task').updateMany(
        { projectId, userId },
        { $unset: { projectId: 1 } }
      );

      res.json({
        success: true,
        message: 'Progetto eliminato con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione progetto:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiungi risorsa al progetto
   */
  async addResource(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { projectId } = req.params;
      const userId = req.user.userId;
      const resourceData = req.body;

      const project = await Project.findOne({ _id: projectId, userId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      project.resources.push(resourceData);
      await project.save();

      res.status(201).json({
        success: true,
        message: 'Risorsa aggiunta con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore aggiunta risorsa:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Rimuovi risorsa dal progetto
   */
  async removeResource(req, res) {
    try {
      const { projectId, resourceId } = req.params;
      const userId = req.user.userId;

      const project = await Project.findOne({ _id: projectId, userId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      project.resources.id(resourceId).remove();
      await project.save();

      res.json({
        success: true,
        message: 'Risorsa rimossa con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore rimozione risorsa:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiungi collaboratore
   */
  async addCollaborator(req, res) {
    try {
      const { projectId } = req.params;
      const { userId: collaboratorId, role = 'viewer' } = req.body;
      const userId = req.user.userId;

      const project = await Project.findOne({ _id: projectId, userId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      // Verifica che il collaboratore non sia già presente
      const existingCollaborator = project.collaborators.find(
        collab => collab.userId.toString() === collaboratorId
      );

      if (existingCollaborator) {
        return res.status(409).json({
          success: false,
          message: 'Collaboratore già presente nel progetto'
        });
      }

      project.collaborators.push({
        userId: collaboratorId,
        role
      });

      await project.save();
      await project.populate('collaborators.userId', 'name email avatar');

      res.status(201).json({
        success: true,
        message: 'Collaboratore aggiunto con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore aggiunta collaboratore:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Rimuovi collaboratore
   */
  async removeCollaborator(req, res) {
    try {
      const { projectId, collaboratorId } = req.params;
      const userId = req.user.userId;

      const project = await Project.findOne({ _id: projectId, userId });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Progetto non trovato'
        });
      }

      project.collaborators.id(collaboratorId).remove();
      await project.save();

      res.json({
        success: true,
        message: 'Collaboratore rimosso con successo',
        data: { project }
      });

    } catch (error) {
      console.error('Errore rimozione collaboratore:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new ProjectController();