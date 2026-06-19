const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    insertLinkedAccount: (parentUserId, childUserId, relationship = 'enfant') =>
        q(
            'INSERT INTO linked_accounts (parent_user_id, child_user_id, relationship) VALUES (?, ?, ?)',
            [parentUserId, childUserId, relationship]
        ),

    getChildrenByParentId: (parentUserId) =>
        q(
            `SELECT c.id, c.firstName, c.lastName, c.email,
                    p.id AS profilId, p.date_naissance AS birthDate,
                    fr.type_forfait AS subscription_type, fr.statut AS subscription_statut,
                    fr.date_debut AS subscription_date_debut, fr.date_fin AS subscription_date_fin
             FROM linked_accounts la
             JOIN compte_connect c ON c.id = la.child_user_id
             LEFT JOIN profil p ON p.compte_id = c.id
             LEFT JOIN (
                 SELECT f.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY f.porteur_id
                            ORDER BY (f.statut = 'Actif') DESC, f.id DESC
                        ) AS rn
                 FROM forfait f
             ) fr ON fr.porteur_id = p.id AND fr.rn = 1
             WHERE la.parent_user_id = ?
             ORDER BY c.firstName`,
            [parentUserId]
        ),
};
