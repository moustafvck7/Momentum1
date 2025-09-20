const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { userValidators } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Applica middleware di autenticazione a tutte le routes
router.use(authMiddleware);

// Configurazione multer per upload avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file immagine sono consentiti'), false);
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *         bio:
 *           type: string
 *           maxLength: 500
 *         preferences:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                 push:
 *                   type: boolean
 *                 taskReminders:
 *                   type: boolean
 *             timezone:
 *               type: string
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Ottieni profilo utente completo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Aggiorna profilo utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Profilo aggiornato con successo
 */
router.put('/profile', userValidators.updateProfile, userController.updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Carica avatar utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar caricato con successo
 */
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Cambia password utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password cambiata con successo
 */
router.put('/password', userValidators.changePassword, userController.changePassword);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Ottieni statistiche utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiche utente
 */
router.get('/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Aggiorna preferenze utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *               notifications:
 *                 type: object
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferenze aggiornate con successo
 */
router.put('/preferences', userController.updatePreferences);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Elimina account utente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account eliminato con successo
 */
router.delete('/account', userValidators.deleteAccount, userController.deleteAccount);

module.exports = router;