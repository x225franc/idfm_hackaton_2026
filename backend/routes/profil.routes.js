const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profil.controller');

/**
 * @swagger
 * tags:
 *   name: Profils
 *   description: Gestion des profils (Porteur, Payeur, Porteur-Payeur)
 */

/**
 * @swagger
 * /api/profils/compte/{compte_id}:
 *   get:
 *     summary: Récupérer tous les profils d'un compte
 *     tags: [Profils]
 *     parameters:
 *       - in: path
 *         name: compte_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des profils
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Profil' }
 *       500:
 *         description: Erreur serveur
 */
router.get('/api/profils/compte/:compte_id', profilController.getByCompte);

/**
 * @swagger
 * /api/profils:
 *   post:
 *     summary: Créer un nouveau profil
 *     tags: [Profils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [compte_id, firstName, lastName]
 *             properties:
 *               compte_id: { type: integer }
 *               type_profil: { type: string, enum: [Porteur, Payeur, Porteur-Payeur], default: Porteur-Payeur }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               date_naissance: { type: string, format: date }
 *               profession: { type: string }
 *               phoneNumber: { type: string }
 *               address: { type: string }
 *               postalCode: { type: string }
 *               city: { type: string }
 *     responses:
 *       201:
 *         description: Profil créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 profil_id: { type: integer }
 *       500:
 *         description: Erreur serveur
 */
router.post('/api/profils', profilController.create);

module.exports = router;
