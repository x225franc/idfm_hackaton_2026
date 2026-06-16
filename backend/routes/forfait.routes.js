const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Souscrire à un nouveau forfait
router.post("/api/forfaits", (req, res) => {
    const { porteur_id, payeur_id, type_forfait } = req.body;

    // Par défaut, le forfait est "En attente de validation" tant que les documents ne sont pas validés par l'admin
    const sql = `INSERT INTO forfait (porteur_id, payeur_id, type_forfait, statut) 
                VALUES (?, ?, ?, 'En attente de validation')`;

    db.query(sql, [porteur_id, payeur_id, type_forfait], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
        res.status(201).json({ message: "Demande de forfait enregistrée", forfait_id: result.insertId });
    });
});

// Récupérer les forfaits actifs ou en attente d'un porteur
router.get("/api/forfaits/porteur/:porteur_id", (req, res) => {
    const sql = "SELECT * FROM forfait WHERE porteur_id = ? ORDER BY date_debut DESC";
    db.query(sql, [req.params.porteur_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

module.exports = router;