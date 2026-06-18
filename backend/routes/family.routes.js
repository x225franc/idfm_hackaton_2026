const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family.controller');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Famille
 *   description: Gestion des proches mineurs rattachés à un compte parent
 */

/**
 * @swagger
 * /api/family/add-child:
 *   post:
 *     summary: Créer le compte d'un proche mineur (< 16 ans) rattaché au parent authentifié
 *     tags: [Famille]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, birthDate, email]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               birthDate: { type: string, format: date }
 *               email: { type: string, format: email }
 *     responses:
 *       201:
 *         description: Compte enfant créé, identifiants envoyés par email
 *       400:
 *         description: Champs manquants ou âge non éligible (>= 16 ans)
 *       401:
 *         description: Authentification requise
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/api/family/add-child', verifyToken, familyController.addChild);

/**
 * @swagger
 * /api/family/children:
 *   get:
 *     summary: Lister les proches du parent authentifié, avec leur abonnement actif s'il existe
 *     tags: [Famille]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des proches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   firstName: { type: string }
 *                   lastName: { type: string }
 *                   email: { type: string }
 *                   activeSubscription:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       type_forfait: { type: string }
 *                       statut: { type: string }
 *                       date_fin: { type: string, format: date }
 *       401:
 *         description: Authentification requise
 */
router.get('/api/family/children', verifyToken, familyController.getChildren);

module.exports = router;
