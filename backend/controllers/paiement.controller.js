const paiementModel = require('../models/paiement.model');
const profilModel = require('../models/profil.model');

const create = async (req, res) => {
    const { forfait_id, payeur_id, montant, type_paiement } = req.body;
    try {
        const ownership = await profilModel.belongsToCompte(payeur_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

        const result = await paiementModel.create(forfait_id, payeur_id, montant, type_paiement);
        res.status(201).json({ message: 'Paiement initié', paiement_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
};

const getByPayeur = async (req, res) => {
    try {
        const ownership = await profilModel.belongsToCompte(req.params.payeur_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

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
