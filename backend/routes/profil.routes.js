const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Récupérer tous les profils rattachés à un compte_connect
router.get("/api/profils/compte/:compte_id", (req, res) => {
    const compte_id = req.params.compte_id;
    const sql = "SELECT * FROM profil WHERE compte_id = ? ORDER BY createdAt DESC";
    
    db.query(sql, [compte_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        res.status(200).json(results);
    });
});

// Créer un nouveau profil (Porteur, Payeur ou Porteur-Payeur)
router.post("/api/profils", (req, res) => {
    const { compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city } = req.body;

    const sql = `INSERT INTO profil 
        (compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    const values = [compte_id, type_profil || 'Porteur-Payeur', firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur lors de la création du profil", error: err });
        res.status(201).json({ message: "Profil créé avec succès", profil_id: result.insertId });
    });
});

module.exports = router;