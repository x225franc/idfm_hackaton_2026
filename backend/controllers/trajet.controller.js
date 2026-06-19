const trajetModel = require('../models/trajet.model');
const userModel = require('../models/user.model');

const getTrajets = async (req, res) => {
    try {
        const rows = await userModel.findByIdWithProfil(req.user.id_user);
        if (!rows.length || !rows[0].profil_id) return res.json([]);
        const trajets = await trajetModel.getByProfilId(rows[0].profil_id);
        res.json(trajets);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getTrajets };
