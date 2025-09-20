const express = require('express');
const authController = require('../controllers/authController');
const { authValidators } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting per le operazioni di autenticazione
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // massimo 5 tentativi per finestra
  message: {
    success: false,
    message: 'Troppi tentativi, riprova tra 15 minuti'
  }
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuovo utente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Utente registrato con successo
 *       400:
 *         description: Dati non validi
 *       409:
 *         description: Email già registrata
 */
router.post('/register', authLimiter, authValidators.register, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login utente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *       401:
 *         description: Credenziali non valide
 */
router.post('/login', authLimiter, authValidators.login, authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout utente
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout effettuato con successo
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshato con successo
 *       401:
 *         description: Refresh token non valido
 */
router.post('/refresh', authValidators.refreshToken, authController.refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ottieni profilo utente corrente
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 *       401:
 *         description: Token non valido
 */
router.get('/me', authMiddleware, authController.me);

module.exports = router;
