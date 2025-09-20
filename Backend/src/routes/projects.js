const express = require('express');
const projectController = require('../controllers/projectController');
const { projectValidators } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
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
 *           maxLength: 2000
 *         category:
 *           type: string
 *           enum: [cv, tech, creativity, other]
 *         status:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         color:
 *           type: string
 *           pattern: ^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
 *         startDate:
 *           type: string
 *           format: date-time
 *         targetDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 30
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Ottieni tutti i progetti dell'utente
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cv, tech, creativity, other]
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
 *         description: Lista dei progetti
 */
router.get('/', projectController.getProjects);

/**
 * @swagger
 * /api/projects/stats:
 *   get:
 *     summary: Ottieni statistiche progetti
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiche progetti
 */
router.get('/stats', projectController.getProjectStats);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Ottieni progetto per ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dettagli progetto
 *       404:
 *         description: Progetto non trovato
 */
router.get('/:projectId', projectController.getProject);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Ottieni tasks di un progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista tasks del progetto
 */
router.get('/:projectId/tasks', projectController.getProjectTasks);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crea nuovo progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Progetto creato con successo
 */
router.post('/', projectValidators.create, projectController.createProject);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Aggiorna progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Progetto aggiornato con successo
 */
router.put('/:projectId', projectController.updateProject);

/**
 * @swagger
 * /api/projects/{projectId}/status:
 *   patch:
 *     summary: Aggiorna status progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status progetto aggiornato con successo
 */
router.patch('/:projectId/status', projectController.updateProjectStatus);

/**
 * @swagger
 * /api/projects/{projectId}/resources:
 *   post:
 *     summary: Aggiungi risorsa a progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [file, link, note]
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risorsa aggiunta con successo
 */
router.post('/:projectId/resources', projectController.addProjectResource);

/**
 * @swagger
 * /api/projects/{projectId}/resources/{resourceId}:
 *   delete:
 *     summary: Rimuovi risorsa da progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risorsa rimossa con successo
 */
router.delete('/:projectId/resources/:resourceId', projectController.removeProjectResource);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Elimina progetto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progetto eliminato con successo
 */
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;