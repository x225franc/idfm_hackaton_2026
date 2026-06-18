const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification et gestion des comptes
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 example: MonMotDePasse123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 jwt: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Identifiants manquants
 *       401:
 *         description: Mauvais identifiants, compte non vérifié ou banni
 */
router.post('/api/login', authController.login);

/**
 * @swagger
 * /api/add/user:
 *   post:
 *     summary: Inscription standard (compte non vérifié)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Jean }
 *               lastName: { type: string, example: Dupont }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageResponse' }
 *       500:
 *         description: Erreur serveur
 */
router.post('/api/add/user', authController.register);

/**
 * @swagger
 * /api/add/user/onboarding:
 *   post:
 *     summary: Inscription via onboarding (compte pré-vérifié)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Jean }
 *               lastName: { type: string, example: Dupont }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur créé et vérifié
 *       409:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/api/add/user/onboarding', authController.registerOnboarding);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Connexion / inscription via Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Access token Google OAuth2
 *     responses:
 *       200:
 *         description: Connexion ou inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 jwt: { type: string }
 *       400:
 *         description: Token manquant
 *       401:
 *         description: Token Google invalide
 */
router.post('/api/auth/google', authController.googleAuth);

/**
 * @swagger
 * /api/verify-email:
 *   post:
 *     summary: Vérifier un compte avec le code reçu par email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Code de vérification à 6 caractères
 *     responses:
 *       200:
 *         description: Compte activé
 *       400:
 *         description: Token manquant
 *       404:
 *         description: Code invalide ou expiré
 */
router.post('/api/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/send-verification-email:
 *   post:
 *     summary: Envoyer (ou renvoyer) le code de vérification par email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Mail envoyé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post(['/api/send-verification-email', '/api/resend-verification-email'], authController.sendVerificationEmail);

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Demander un lien de réinitialisation du mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Mail de réinitialisation envoyé
 *       404:
 *         description: Compte introuvable
 */
router.post('/api/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/reset-password:
 *   get:
 *     summary: Vérifier la validité d'un token de réinitialisation
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: uid
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Token valide
 *       400:
 *         description: Token manquant
 *       404:
 *         description: Token introuvable
 *   post:
 *     summary: Enregistrer le nouveau mot de passe
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, example: NouveauMotDePasse123 }
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 *       400:
 *         description: Token manquant
 *       404:
 *         description: Token introuvable
 */
router.get('/api/reset-password', authController.getResetPassword);
router.post('/api/reset-password', authController.resetPassword);

module.exports = router;
