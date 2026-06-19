const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    create: (porteur_id, payeur_id, type_forfait) =>
        q(
            `INSERT INTO forfait (porteur_id, payeur_id, type_forfait, statut)
             VALUES (?, ?, ?, 'En attente de validation')`,
            [porteur_id, payeur_id, type_forfait]
        ),

    getByPorteurId: (porteur_id) =>
        q('SELECT * FROM forfait WHERE porteur_id = ? ORDER BY date_debut DESC', [porteur_id]),

    getByPorteurIds: (profilIds) =>
        profilIds.length === 0
            ? Promise.resolve([])
            : q('SELECT * FROM forfait WHERE porteur_id IN (?) ORDER BY date_debut DESC', [profilIds]),

    getAll: () =>
        q(
            `SELECT f.*,
                    porteur.firstName AS porteur_nom, porteur.lastName AS porteur_prenom,
                    payeur.firstName AS payeur_nom, payeur.lastName AS payeur_prenom
             FROM forfait f
             JOIN profil porteur ON f.porteur_id = porteur.id
             JOIN profil payeur ON f.payeur_id = payeur.id
             ORDER BY f.date_debut DESC`
        ),

    updateStatus: (id, statut, date_debut, date_fin) => {
        let sql = 'UPDATE forfait SET statut = ?';
        const values = [statut];
        if (date_debut && date_fin) {
            sql += ', date_debut = ?, date_fin = ?';
            values.push(date_debut, date_fin);
        }
        sql += ' WHERE id = ?';
        values.push(id);
        return q(sql, values);
    },

    getOwnerInfo: (id) =>
        q(
            `SELECT f.type_forfait, p.compte_id
             FROM forfait f
             JOIN profil p ON f.porteur_id = p.id
             WHERE f.id = ?`,
            [id]
        ),

    getCore: (id) =>
        q('SELECT id, porteur_id, payeur_id, type_forfait, statut FROM forfait WHERE id = ?', [id]),

    resetToPending: (id) =>
        q(
            `UPDATE forfait SET statut = 'En attente de validation', date_debut = NULL, date_fin = NULL WHERE id = ?`,
            [id]
        ),
};
