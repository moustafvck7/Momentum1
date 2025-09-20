const Note = require('../models/Note');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Controller per gestione note
 */
class NoteController {

  /**
   * Ottieni tutte le note dell'utente
   */
  async getNotes(req, res) {
    try {
      const userId = req.user.userId;
      const {
        category,
        search,
        tags,
        isBookmarked,
        isArchived = false,
        page = 1,
        limit = 20,
        sortBy = 'lastEditedAt',
        sortOrder = 'desc'
      } = req.query;

      // Costruisci filtro
      const filter = { userId: new mongoose.Types.ObjectId(userId), isArchived: isArchived === 'true' };
      
      if (category) filter.category = category;
      if (isBookmarked !== undefined) filter.isBookmarked = isBookmarked === 'true';
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
      }
      if (search) {
        filter.$text = { $search: search };
      }

      // Opzioni paginazione
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Esegui query
      const [notes, total] = await Promise.all([
        Note.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .select('-content'), // Escludi contenuto per performance nelle liste
        Note.countDocuments(filter)
      ]);

      // Statistiche categorie
      const categoryStats = await Note.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          notes,
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
      console.error('Errore recupero note:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Ottieni nota per ID
   */
  async getNote(req, res) {
    try {
      const { noteId } = req.params;
      const userId = req.user.userId;

      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Nota non trovata'
        });
      }

      res.json({
        success: true,
        data: { note }
      });

    } catch (error) {
      console.error('Errore recupero nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Crea nuova nota
   */
  async createNote(req, res) {
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
      const noteData = { ...req.body, userId };

      const note = new Note(noteData);
      await note.save();

      res.status(201).json({
        success: true,
        message: 'Nota creata con successo',
        data: { note }
      });

    } catch (error) {
      console.error('Errore creazione nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiorna nota
   */
  async updateNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dati non validi',
          errors: errors.array()
        });
      }

      const { noteId } = req.params;
      const userId = req.user.userId;

      const note = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Nota non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Nota aggiornata con successo',
        data: { note }
      });

    } catch (error) {
      console.error('Errore aggiornamento nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Elimina nota
   */
  async deleteNote(req, res) {
    try {
      const { noteId } = req.params;
      const userId = req.user.userId;

      const note = await Note.findOneAndDelete({ _id: noteId, userId });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Nota non trovata'
        });
      }

      res.json({
        success: true,
        message: 'Nota eliminata con successo'
      });

    } catch (error) {
      console.error('Errore eliminazione nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Archivia/Ripristina nota
   */
  async toggleArchiveNote(req, res) {
    try {
      const { noteId } = req.params;
      const userId = req.user.userId;

      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Nota non trovata'
        });
      }

      note.isArchived = !note.isArchived;
      await note.save();

      res.json({
        success: true,
        message: note.isArchived ? 'Nota archiviata con successo' : 'Nota ripristinata con successo',
        data: { note }
      });

    } catch (error) {
      console.error('Errore archiviazione nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  /**
   * Aggiungi/Rimuovi bookmark
   */
  async toggleBookmark(req, res) {
    try {
      const { noteId } = req.params;
      const userId = req.user.userId;

      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Nota non trovata'
        });
      }

      note.isBookmarked = !note.isBookmarked;
      await note.save();

      res.json({
        success: true,
        message: note.isBookmarked ? 'Nota aggiunta ai preferiti' : 'Nota rimossa dai preferiti',
        data: { note }
      });

    } catch (error) {
      console.error('Errore bookmark nota:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = new NoteController();