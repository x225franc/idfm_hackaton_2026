const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiement.controller');

/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: Gestion des paiements de forfaits
 */

/**
 * @swagger
 * /api/paiements:
 *   post:
 *     summary: Initialiser un paiement pour un forfait
 *     tags: [Paiements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [forfait_id, payeur_id, montant, type_paiement]
 *             properties:
 *               forfait_id: { type: integer }
 *               payeur_id: { type: integer }
 *               montant: { type: number, format: float, example: 86.40 }
 *               type_paiement:
 *                 type: string
 *                 enum: [Prélèvement automatique, Paiement direct, Virement]
 *     responses:
 *       201:
 *         description: Paiement initié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 paiement_id: { type: integer }
 *       500:
 *         description: Erreur serveur
 */
router.post('/api/paiements', paiementController.create);

/**
 * @swagger
 * /api/paiements/payeur/{payeur_id}:
 *   get:
 *     summary: Historique des paiements d'un payeur
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: payeur_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Historique des paiements avec le type de forfait associé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - { $ref: '#/components/schemas/Paiement' }
 *                   - type: object
 *                     properties:
 *                       type_forfait: { type: string }
 */
router.get('/api/paiements/payeur/:payeur_id', paiementController.getByPayeur);

/**
 * @swagger
 * /api/paiements/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'un paiement
 *     tags: [Paiements]
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
 *             required: [statut_paiement]
 *             properties:
 *               statut_paiement:
 *                 type: string
 *                 enum: [Réussi, Échoué, En attente]
 *     responses:
 *       200:
 *         description: Statut du paiement mis à jour
 *       500:
 *         description: Erreur serveur
 */
router.put('/api/paiements/:id/status', paiementController.updateStatus);

module.exports = router;
