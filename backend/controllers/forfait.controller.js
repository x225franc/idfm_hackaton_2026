const forfaitModel = require('../models/forfait.model');
const profilModel = require('../models/profil.model');
const notifModel = require('../models/notification.model');
const paiementModel = require('../models/paiement.model');

const create = async (req, res) => {
    const { porteur_id, payeur_id, type_forfait } = req.body;
    try {
        const [porteurRows, payeurRows] = await Promise.all([
            profilModel.belongsToFamily(porteur_id, req.user.id_user),
            profilModel.belongsToCompte(payeur_id, req.user.id_user),
        ]);
        if (porteurRows.length === 0 || payeurRows.length === 0)
            return res.status(403).json({ message: 'Accès refusé' });

        const result = await forfaitModel.create(porteur_id, payeur_id, type_forfait);
        res.status(201).json({ message: 'Demande de forfait enregistrée', forfait_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
};

const getByPorteur = async (req, res) => {
    try {
        const ownership = await profilModel.belongsToCompte(req.params.porteur_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

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
        const [owner] = await forfaitModel.getOwnerInfo(req.params.id);
        await forfaitModel.updateStatus(req.params.id, statut, date_debut, date_fin);

        if (owner) {
            await notifModel.create(
                owner.compte_id,
                'forfait_statut_change',
                `Votre ${owner.type_forfait} est désormais ${statut}`,
                `Le statut de votre abonnement ${owner.type_forfait} a été mis à jour : ${statut}.`,
                Number(req.params.id)
            );
        }

        res.status(200).json({ message: `Le forfait est désormais ${statut}` });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const renew = async (req, res) => {
    const { montant, type_paiement } = req.body;
    try {
        const [forfait] = await forfaitModel.getCore(req.params.id);
        if (!forfait) return res.status(404).json({ message: 'Forfait introuvable' });
        if (forfait.statut !== 'A renouveler')
            return res.status(400).json({ message: 'Ce forfait ne peut pas être renouvelé.' });

        const ownership = await profilModel.belongsToFamily(forfait.porteur_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

        await forfaitModel.resetToPending(forfait.id);
        const paiement = await paiementModel.create(forfait.id, forfait.payeur_id, montant, type_paiement);

        res.status(201).json({ message: 'Demande de renouvellement enregistrée', paiement_id: paiement.insertId });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { create, getByPorteur, getAll, updateStatus, renew };
