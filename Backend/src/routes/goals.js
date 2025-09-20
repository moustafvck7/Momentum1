const express = require('express');
const goalController = require('../controllers/goalController');
const { goalValidators } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - targetValue
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 2000
 *         category:
 *           type: string
 *           enum: [personal, career, health, learning, financial, other]
 *         status:
 *           type: string
 *           enum: [active, completed, paused, cancelled]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         targetValue:
 *           type: number
 *           minimum: 0
 *         currentValue:
 *           type: number
 *           minimum: 0
 *         unit:
 *           type: string
 *           maxLength: 20
 *         targetDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 30
 *         isPublic:
 *           type: boolean
 */

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Ottieni tutti gli obiettivi dell'utente
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, paused, cancelled]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [personal, career, health, learning, financial, other]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
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
 *         description: Lista degli obiettivi
 */
router.get('/', goalController.getGoals);

/**
 * @swagger
 * /api/goals/stats:
 *   get:
 *     summary: Ottieni statistiche obiettivi
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiche obiettivi
 */
router.get('/stats', goalController.getGoalStats);

/**
 * @swagger
 * /api/goals/{goalId}:
 *   get:
 *     summary: Ottieni obiettivo per ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dettagli obiettivo
 *       404:
 *         description: Obiettivo non trovato
 */
router.get('/:goalId', goalController.getGoal);

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Crea nuovo obiettivo
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       201:
 *         description: Obiettivo creato con successo
 */
router.post('/', goalValidators.create, goalController.createGoal);

/**
 * @swagger
 * /api/goals/{goalId}:
 *   put:
 *     summary: Aggiorna obiettivo
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       200:
 *         description: Obiettivo aggiornato con successo
 */
router.put('/:goalId', goalController.updateGoal);

/**
 * @swagger
 * /api/goals/{goalId}/progress:
 *   patch:
 *     summary: Aggiorna progresso obiettivo
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
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
 *               - currentValue
 *             properties:
 *               currentValue:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Progresso aggiornato con successo
 */
router.patch('/:goalId/progress', goalController.updateGoalProgress);

/**
 * @swagger
 * /api/goals/{goalId}:
 *   delete:
 *     summary: Elimina obiettivo
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Obiettivo eliminato con successo
 */
router.delete('/:goalId', goalController.deleteGoal);

module.exports = router;