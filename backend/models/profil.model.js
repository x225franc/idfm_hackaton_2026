const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    getByCompteId: (compte_id) =>
        q('SELECT * FROM profil WHERE compte_id = ? ORDER BY createdAt DESC', [compte_id]),

    create: ({ compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city }) =>
        q(
            `INSERT INTO profil (compte_id, type_profil, firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [compte_id, type_profil || 'Porteur-Payeur', firstName, lastName, date_naissance, profession, phoneNumber, address, postalCode, city]
        ),

    belongsToCompte: (profilId, compteId) =>
        q('SELECT id FROM profil WHERE id = ? AND compte_id = ?', [profilId, compteId]),
};
