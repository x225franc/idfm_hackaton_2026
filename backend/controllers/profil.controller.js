const profilModel = require('../models/profil.model');

const getByCompte = async (req, res) => {
    if (parseInt(req.params.compte_id) !== req.user.id_user)
        return res.status(403).json({ message: 'Accès refusé' });
    try {
        const results = await profilModel.getByCompteId(req.params.compte_id);
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const create = async (req, res) => {
    if (parseInt(req.body.compte_id) !== req.user.id_user)
        return res.status(403).json({ message: 'Accès refusé' });
    try {
        const result = await profilModel.create(req.body);
        res.status(201).json({ message: 'Profil créé avec succès', profil_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création du profil', error: err });
    }
};

module.exports = { getByCompte, create };
