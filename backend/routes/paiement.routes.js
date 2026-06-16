const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Initialiser un paiement pour un forfait
router.post("/api/paiements", (req, res) => {
    const { forfait_id, payeur_id, montant, type_paiement } = req.body;

    const sql = `INSERT INTO paiement (forfait_id, payeur_id, montant, type_paiement, statut_paiement, date_paiement) 
                 VALUES (?, ?, ?, ?, 'En attente', NOW())`;

    db.query(sql, [forfait_id, payeur_id, montant, type_paiement], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
        res.status(201).json({ message: "Paiement initié", paiement_id: result.insertId });
    });
});

// Récupérer l'historique des paiements d'un payeur (Pour la facture client)
router.get("/api/paiements/payeur/:payeur_id", (req, res) => {
    const sql = `
        SELECT p.*, f.type_forfait 
        FROM paiement p 
        JOIN forfait f ON p.forfait_id = f.id 
        WHERE p.payeur_id = ? 
        ORDER BY p.date_paiement DESC`;
        
    db.query(sql, [req.params.payeur_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

// Simuler la validation d'un paiement (Webhook / Admin)
router.put("/api/paiements/:id/status", (req, res) => {
    const { statut_paiement } = req.body;
    const sql = "UPDATE paiement SET statut_paiement = ? WHERE id = ?";

    db.query(sql, [statut_paiement, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json({ message: `Paiement mis à jour en : ${statut_paiement}` });
    });
});

module.exports = router;