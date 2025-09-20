const express = require('express');
const taskController = require('../controllers/taskController');
const { taskValidators } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 1000
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         category:
 *           type: string
 *           enum: [work, personal, health, learning, other]
 *         dueDate:
 *           type: string
 *           format: date-time
 *         estimatedDuration:
 *           type: number
 *           minimum: 1
 *           maximum: 1440
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Ottieni tutte le tasks dell'utente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [work, personal, health, learning, other]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Lista delle tasks
 */
router.get('/', taskValidators.query, taskController.getTasks);

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Ottieni statistiche tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 7d
 *     responses:
 *       200:
 *         description: Statistiche tasks
 */
router.get('/stats', taskController.getTaskStats);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Ottieni task per ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dettagli task
 *       404:
 *         description: Task non trovata
 */
router.get('/:taskId', taskValidators.getById, taskController.getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crea nuova task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task creata con successo
 */
router.post('/', taskValidators.create, taskController.createTask);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   put:
 *     summary: Aggiorna task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task aggiornata con successo
 */
router.put('/:taskId', taskValidators.update, taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{taskId}/status:
 *   patch:
 *     summary: Aggiorna status task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status aggiornato con successo
 */
router.patch('/:taskId/status', taskController.updateTaskStatus);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     summary: Elimina task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task eliminata con successo
 */
router.delete('/:taskId', taskValidators.getById, taskController.deleteTask);

module.exports = router;