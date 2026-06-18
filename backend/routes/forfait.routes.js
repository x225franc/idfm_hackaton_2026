const express = require('express');
const router = express.Router();
const forfaitController = require('../controllers/forfait.controller');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const requireVerified = require('../middleware/requireVerified');

/**
 * @swagger
 * tags:
 *   name: Forfaits
 *   description: Gestion des abonnements de transport
 */

/**
 * @swagger
 * /api/forfaits:
 *   post:
 *     summary: Souscrire à un nouveau forfait
 *     tags: [Forfaits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [porteur_id, payeur_id, type_forfait]
 *             properties:
 *               porteur_id: { type: integer }
 *               payeur_id: { type: integer }
 *               type_forfait:
 *                 type: string
 *                 enum: [Navigo Annuel, Imagine R Etudiant, Imagine R Junior, Imagine R Scolaire, Liberté+, TST, Améthyste, Navigo Senior, Réduction 50%, Solidarité 75%, Solidarité Gratuité, Handicap, Accompagnant Handicap]
 *     responses:
 *       201:
 *         description: Demande de forfait enregistrée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 forfait_id: { type: integer }
 *       500:
 *         description: Erreur serveur
 */
router.post('/api/forfaits', authMiddleware, forfaitController.create);

/**
 * @swagger
 * /api/forfaits/porteur/{porteur_id}:
 *   get:
 *     summary: Récupérer les forfaits d'un porteur
 *     tags: [Forfaits]
 *     parameters:
 *       - in: path
 *         name: porteur_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des forfaits du porteur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Forfait' }
 */
router.get('/api/forfaits/porteur/:porteur_id', authMiddleware, requireVerified, forfaitController.getByPorteur);

/**
 * @swagger
 * /api/admin/forfaits:
 *   get:
 *     summary: Récupérer tous les forfaits avec infos porteur et payeur (admin)
 *     tags: [Forfaits]
 *     responses:
 *       200:
 *         description: Liste complète des forfaits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - { $ref: '#/components/schemas/Forfait' }
 *                   - type: object
 *                     properties:
 *                       porteur_nom: { type: string }
 *                       porteur_prenom: { type: string }
 *                       payeur_nom: { type: string }
 *                       payeur_prenom: { type: string }
 */
router.get('/api/admin/forfaits', authMiddleware, requireAdmin, forfaitController.getAll);

/**
 * @swagger
 * /api/admin/forfaits/{id}/status:
 *   put:
 *     summary: Changer le statut d'un forfait (admin)
 *     tags: [Forfaits]
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
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [Actif, Suspendu, À renouveler, En attente de validation]
 *               date_debut: { type: string, format: date }
 *               date_fin: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Statut du forfait mis à jour
 *       500:
 *         description: Erreur serveur
 */
router.put('/api/admin/forfaits/:id/status', authMiddleware, requireAdmin, forfaitController.updateStatus);

module.exports = router;
