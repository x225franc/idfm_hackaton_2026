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

// Récupérer tous les forfaits avec les infos du porteur et payeur
router.get("/api/admin/forfaits", (req, res) => {
    const sql = `
        SELECT f.*, 
               porteur.firstName AS porteur_nom, porteur.lastName AS porteur_prenom,
               payeur.firstName AS payeur_nom, payeur.lastName AS payeur_prenom
        FROM forfait f
        JOIN profil porteur ON f.porteur_id = porteur.id
        JOIN profil payeur ON f.payeur_id = payeur.id
        ORDER BY f.date_debut DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

// Changer le statut d'un forfait (Ex: de 'En attente' à 'Actif' ou 'Suspendu')
router.put("/api/admin/forfaits/:id/status", (req, res) => {
    const { statut, date_debut, date_fin } = req.body;
    let sql = "UPDATE forfait SET statut = ?";
    const values = [statut];

    // Si on active le forfait, on peut définir sa date de validité
    if (date_debut && date_fin) {
        sql += ", date_debut = ?, date_fin = ?";
        values.push(date_debut, date_fin);
    }

    sql += " WHERE id = ?";
    values.push(req.params.id);

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json({ message: `Le forfait est désormais ${statut}` });
    });
});

module.exports = router;