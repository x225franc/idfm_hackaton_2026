const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// ROUTES UTILISATEURS
// ==========================================

// Upload d'un document 
router.post("/api/documents/upload", (req, res) => {
    const { profil_id, type_document } = req.body;
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    const file = req.files[0];
    const chemin_fichier = "/images/" + file.filename;

    const sql = `INSERT INTO document (profil_id, type_document, chemin_fichier, statut_verification, uploadedAt) 
                VALUES (?, ?, ?, 'En attente', NOW())`;

    db.query(sql, [profil_id, type_document, chemin_fichier], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur d'insertion en BDD" });
        res.status(201).json({ message: "Document envoyé pour vérification", document_id: result.insertId });
    });
});

// Récupérer les documents d'un profil
router.get("/api/documents/profil/:profil_id", (req, res) => {
    const sql = "SELECT * FROM document WHERE profil_id = ? ORDER BY uploadedAt DESC";
    db.query(sql, [req.params.profil_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

// ==========================================
// ROUTES ADMIN (BACKOFFICE)
// ==========================================

// 1. Récupérer tous les documents "En attente" avec les infos du profil associé
router.get("/api/admin/documents/pending", (req, res) => {
    const sql = `
        SELECT d.*, p.firstName, p.lastName, p.type_profil, c.email as compte_email
        FROM document d
        JOIN profil p ON d.profil_id = p.id
        JOIN compte_connect c ON p.compte_id = c.id
        WHERE d.statut_verification = 'En attente'
        ORDER BY d.uploadedAt ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

// 2. Valider ou Refuser un document
router.put("/api/admin/documents/:id/status", (req, res) => {
    const docId = req.params.id;
    const { statut_verification, commentaire_admin } = req.body;

    if (!['Validé', 'Refusé'].includes(statut_verification)) {
        return res.status(400).json({ message: "Statut invalide" });
    }

    const sql = "UPDATE document SET statut_verification = ?, commentaire_admin = ? WHERE id = ?";
    
    db.query(sql, [statut_verification, commentaire_admin || null, docId], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        
        res.status(200).json({ message: `Document marqué comme ${statut_verification}` });
    });
});

module.exports = router;