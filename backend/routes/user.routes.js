const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const requireVerified = require('../middleware/requireVerified');

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des comptes utilisateurs
 */

/**
 * @swagger
 * /api/get/user:
 *   get:
 *     summary: Récupérer tous les comptes
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get('/api/get/user', authMiddleware, requireAdmin, userController.getAll);

/**
 * @swagger
 * /api/get/user/admin:
 *   get:
 *     summary: Liste paginée et filtrée des utilisateurs (backoffice admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Recherche sur email, prénom ou nom
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, banned] }
 *     responses:
 *       200:
 *         description: Résultats paginés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 total: { type: integer }
 *                 limit: { type: integer }
 *                 offset: { type: integer }
 */
router.get('/api/get/user/admin', authMiddleware, requireAdmin, userController.getAllAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Créer un compte directement depuis le backoffice (rôle choisi, pré-vérifié)
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Champs manquants ou rôle invalide
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/api/admin/users', authMiddleware, requireAdmin, userController.adminCreate);

/**
 * @swagger
 * /api/admin/users/{id}/full:
 *   get:
 *     summary: Vue détaillée d'un compte (profils, documents, forfaits, paiements) pour le backoffice
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détail complet du compte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *                 profils:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Profil' }
 *                 documents:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Document' }
 *                 forfaits:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Forfait' }
 *                 paiements:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Paiement' }
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/api/admin/users/:id/full', authMiddleware, requireAdmin, userController.getFullDetail);

/**
 * @swagger
 * /api/get/user/{id}:
 *   get:
 *     summary: Récupérer un utilisateur avec son profil
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Données utilisateur + profil
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserWithProfil' }
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/api/get/user/:id', authMiddleware, requireVerified, userController.getById);

/**
 * @swagger
 * /api/update/user/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (mot de passe, adresse, photo)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               password: { type: string }
 *               address: { type: string }
 *               postalCode: { type: string }
 *               city: { type: string }
 *               phoneNumber: { type: string }
 *               images:
 *                 type: string
 *                 format: binary
 *                 description: Photo de profil (JPEG/PNG, max 5 Mo)
 *     responses:
 *       200:
 *         description: Mise à jour effectuée
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/api/update/user/:id', authMiddleware, requireVerified, userController.update);

/**
 * @swagger
 * /api/ban/user/{id}:
 *   put:
 *     summary: Bannir un utilisateur (admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Utilisateur banni
 *       500:
 *         description: Erreur serveur
 */
router.put('/api/ban/user/:id', authMiddleware, requireAdmin, userController.ban);

/**
 * @swagger
 * /api/unban/user/{id}:
 *   put:
 *     summary: Rétablir un utilisateur banni (admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Utilisateur rétabli
 *       500:
 *         description: Erreur serveur
 */
router.put('/api/unban/user/:id', authMiddleware, requireAdmin, userController.unban);

/**
 * @swagger
 * /api/user/{id}/role:
 *   put:
 *     summary: Changer le rôle d'un utilisateur (admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Rôle modifié
 *       400:
 *         description: Rôle invalide
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/api/user/:id/role', authMiddleware, requireAdmin, userController.updateRole);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Suppression totale du compte (RGPD)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Compte et données supprimés
 *       404:
 *         description: Compte introuvable
 */
router.delete('/api/user/:id', authMiddleware, requireAdmin, userController.remove);

module.exports = router;
