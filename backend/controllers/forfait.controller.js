const forfaitModel = require('../models/forfait.model');

const create = async (req, res) => {
    const { porteur_id, payeur_id, type_forfait } = req.body;
    try {
        const result = await forfaitModel.create(porteur_id, payeur_id, type_forfait);
        res.status(201).json({ message: 'Demande de forfait enregistrée', forfait_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
};

const getByPorteur = async (req, res) => {
    try {
        const results = await forfaitModel.getByPorteurId(req.params.porteur_id);
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAll = async (req, res) => {
    try {
        const results = await forfaitModel.getAll();
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateStatus = async (req, res) => {
    const { statut, date_debut, date_fin } = req.body;
    try {
        await forfaitModel.updateStatus(req.params.id, statut, date_debut, date_fin);
        res.status(200).json({ message: `Le forfait est désormais ${statut}` });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { create, getByPorteur, getAll, updateStatus };
