const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    create: (forfait_id, payeur_id, montant, type_paiement) =>
        q(
            `INSERT INTO paiement (forfait_id, payeur_id, montant, type_paiement, statut_paiement, date_paiement)
             VALUES (?, ?, ?, ?, 'En attente', NOW())`,
            [forfait_id, payeur_id, montant, type_paiement]
        ),

    getByPayeurId: (payeur_id) =>
        q(
            `SELECT p.*, f.type_forfait
             FROM paiement p
             JOIN forfait f ON p.forfait_id = f.id
             WHERE p.payeur_id = ?
             ORDER BY p.date_paiement DESC`,
            [payeur_id]
        ),

    getByPayeurIds: (profilIds) =>
        profilIds.length === 0
            ? Promise.resolve([])
            : q(
                `SELECT p.*, f.type_forfait
                 FROM paiement p
                 JOIN forfait f ON p.forfait_id = f.id
                 WHERE p.payeur_id IN (?)
                 ORDER BY p.date_paiement DESC`,
                [profilIds]
            ),

    updateStatus: (id, statut) =>
        q('UPDATE paiement SET statut_paiement = ? WHERE id = ?', [statut, id]),
};
