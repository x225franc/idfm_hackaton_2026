const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

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
router.get('/api/get/user', userController.getAll);

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
router.get('/api/get/user/admin', userController.getAllAdmin);

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
router.get('/api/get/user/:id', userController.getById);

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
router.put('/api/update/user/:id', userController.update);

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
router.put('/api/ban/user/:id', userController.ban);

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
router.put('/api/unban/user/:id', userController.unban);

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
router.put('/api/user/:id/role', userController.updateRole);

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
router.delete('/api/user/:id', userController.remove);

module.exports = router;
