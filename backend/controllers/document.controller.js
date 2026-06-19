const documentModel = require('../models/document.model');
const profilModel = require('../models/profil.model');
const notifModel = require('../models/notification.model');

const upload = async (req, res) => {
    const { profil_id, type_document } = req.body;
    if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: 'Aucun fichier uploadé' });

    try {
        const ownership = await profilModel.belongsToCompte(profil_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

        const chemin_fichier = '/documents/' + req.files[0].filename;
        const result = await documentModel.create(profil_id, type_document, chemin_fichier);
        res.status(201).json({ message: 'Document envoyé pour vérification', document_id: result.insertId });
    } catch {
        res.status(500).json({ message: "Erreur d'insertion en BDD" });
    }
};

const getByProfil = async (req, res) => {
    try {
        const ownership = await profilModel.belongsToCompte(req.params.profil_id, req.user.id_user);
        if (ownership.length === 0) return res.status(403).json({ message: 'Accès refusé' });

        const results = await documentModel.getByProfilId(req.params.profil_id);
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getPending = async (req, res) => {
    try {
        const results = await documentModel.getPending();
        res.status(200).json(results);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateStatus = async (req, res) => {
    const { statut_verification, commentaire_admin } = req.body;
    if (!['Validé', 'Refusé'].includes(statut_verification))
        return res.status(400).json({ message: 'Statut invalide' });

    try {
        const [owner] = await documentModel.getOwnerInfo(req.params.id);
        await documentModel.updateStatus(req.params.id, statut_verification, commentaire_admin);

        if (owner) {
            const validated = statut_verification === 'Validé';
            const titre = validated ? 'Document validé' : 'Document refusé';
            const message = validated
                ? `Votre document "${owner.type_document}" a été validé.`
                : `Votre document "${owner.type_document}" a été refusé.${commentaire_admin ? ' Motif : ' + commentaire_admin : ''}`;
            await notifModel.create(owner.compte_id, validated ? 'document_valide' : 'document_refuse', titre, message);
        }

        res.status(200).json({ message: `Document marqué comme ${statut_verification}` });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { upload, getByProfil, getPending, updateStatus };
