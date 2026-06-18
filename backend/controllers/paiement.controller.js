const paiementModel = require('../models/paiement.model');

const create = async (req, res) => {
    const { forfait_id, payeur_id, montant, type_paiement } = req.body;
    try {
        const result = await paiementModel.create(forfait_id, payeur_id, montant, type_paiement);
        res.status(201).json({ message: 'Paiement initié', paiement_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
};

const getByPayeur = async (req, res) => {
    try {
        const results = await paiementModel.getByPayeurId(req.params.payeur_id);
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateStatus = async (req, res) => {
    const { statut_paiement } = req.body;
    try {
        await paiementModel.updateStatus(req.params.id, statut_paiement);
        res.status(200).json({ message: `Paiement mis à jour en : ${statut_paiement}` });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { create, getByPayeur, updateStatus };
