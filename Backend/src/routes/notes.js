const express = require('express');
const noteController = require('../controllers/noteController');
const { noteValidators } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *           maxLength: 50000
 *         category:
 *           type: string
 *           enum: [work, personal, ideas, other]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 30
 *         isBookmarked:
 *           type: boolean
 *         isArchived:
 *           type: boolean
 *         color:
 *           type: string
 *           pattern: ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Ottieni tutte le note dell'utente
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [work, personal, ideas, other]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: Tags separati da virgola
 *       - in: query
 *         name: isBookmarked
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *           default: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lista delle note
 */
router.get('/', noteController.getNotes);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   get:
 *     summary: Ottieni nota per ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dettagli nota
 *       404:
 *         description: Nota non trovata
 */
router.get('/:noteId', noteController.getNote);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Crea nuova nota
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       201:
 *         description: Nota creata con successo
 */
router.post('/', noteValidators.create, noteController.createNote);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   put:
 *     summary: Aggiorna nota
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Nota aggiornata con successo
 */
router.put('/:noteId', noteController.updateNote);

/**
 * @swagger
 * /api/notes/{noteId}:
 *   delete:
 *     summary: Elimina nota
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nota eliminata con successo
 */
router.delete('/:noteId', noteController.deleteNote);

module.exports = router;