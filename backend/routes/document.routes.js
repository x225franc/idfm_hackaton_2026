const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Upload et vérification des documents justificatifs
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Uploader un document justificatif
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profil_id, type_document, images]
 *             properties:
 *               profil_id: { type: integer }
 *               type_document:
 *                 type: string
 *                 enum: ["Pièce d'identité", "Attestation de bourse", "Justificatif TST", "Photo d'identité"]
 *               images:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG/PNG, max 5 Mo)
 *     responses:
 *       201:
 *         description: Document envoyé pour vérification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 document_id: { type: integer }
 *       400:
 *         description: Aucun fichier uploadé
 *       500:
 *         description: Erreur d'insertion
 */
router.post('/api/documents/upload', documentController.upload);

/**
 * @swagger
 * /api/documents/profil/{profil_id}:
 *   get:
 *     summary: Récupérer les documents d'un profil
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: profil_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Document' }
 */
router.get('/api/documents/profil/:profil_id', documentController.getByProfil);

/**
 * @swagger
 * /api/admin/documents/pending:
 *   get:
 *     summary: Récupérer tous les documents en attente de vérification (admin)
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents en attente avec infos profil et compte
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - { $ref: '#/components/schemas/Document' }
 *                   - type: object
 *                     properties:
 *                       firstName: { type: string }
 *                       lastName: { type: string }
 *                       type_profil: { type: string }
 *                       compte_email: { type: string }
 */
router.get('/api/admin/documents/pending', documentController.getPending);

/**
 * @swagger
 * /api/admin/documents/{id}/status:
 *   put:
 *     summary: Valider ou refuser un document (admin)
 *     tags: [Documents]
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
 *             required: [statut_verification]
 *             properties:
 *               statut_verification: { type: string, enum: [Validé, Refusé] }
 *               commentaire_admin: { type: string }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       400:
 *         description: Statut invalide
 */
router.put('/api/admin/documents/:id/status', documentController.updateStatus);

module.exports = router;
