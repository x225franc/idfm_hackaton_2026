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

    // Proches d'un parent, avec leur abonnement actif si le proche en a un (sinon NULL).
    getChildrenByParentId: (parentUserId) =>
        q(
            `SELECT c.id, c.firstName, c.lastName, c.email,
                    f.type_forfait AS subscription_type, f.statut AS subscription_statut, f.date_fin AS subscription_date_fin
             FROM linked_accounts la
             JOIN compte_connect c ON c.id = la.child_user_id
             LEFT JOIN profil p ON p.compte_id = c.id
             LEFT JOIN forfait f ON f.porteur_id = p.id AND f.statut = 'Actif'
             WHERE la.parent_user_id = ?
             ORDER BY c.firstName`,
            [parentUserId]
        ),
};
