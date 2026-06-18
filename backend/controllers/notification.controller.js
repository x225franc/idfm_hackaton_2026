const notifModel = require('../models/notification.model');

const getAll = async (req, res) => {
    try {
        const compte_id = req.user.id_user;
        const rows = await notifModel.getByCompteId(compte_id);
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const countUnread = async (req, res) => {
    try {
        const compte_id = req.user.id_user;
        const [row] = await notifModel.countUnread(compte_id);
        res.json({ total: row.total });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const markAllRead = async (req, res) => {
    try {
        const compte_id = req.user.id_user;
        await notifModel.markAllRead(compte_id);
        res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const markOneRead = async (req, res) => {
    try {
        const compte_id = req.user.id_user;
        await notifModel.markOneRead(Number(req.params.id), compte_id);
        res.json({ message: 'Notification marquée comme lue.' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getAll, countUnread, markAllRead, markOneRead };
