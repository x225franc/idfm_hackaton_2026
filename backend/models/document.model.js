const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    create: (profil_id, type_document, chemin_fichier) =>
        q(
            `INSERT INTO document (profil_id, type_document, chemin_fichier, statut_verification, uploadedAt)
             VALUES (?, ?, ?, 'En attente', NOW())`,
            [profil_id, type_document, chemin_fichier]
        ),

    getByProfilId: (profil_id) =>
        q('SELECT * FROM document WHERE profil_id = ? ORDER BY uploadedAt DESC', [profil_id]),

    // Tous les documents des profils donnés (vue détail admin d'un compte pouvant porter plusieurs profils).
    getByProfilIds: (profilIds) =>
        profilIds.length === 0
            ? Promise.resolve([])
            : q('SELECT * FROM document WHERE profil_id IN (?) ORDER BY uploadedAt DESC', [profilIds]),

    getPending: () =>
        q(
            `SELECT d.*, p.firstName, p.lastName, p.type_profil, c.email AS compte_email
             FROM document d
             JOIN profil p ON d.profil_id = p.id
             JOIN compte_connect c ON p.compte_id = c.id
             WHERE d.statut_verification = 'En attente'
             ORDER BY d.uploadedAt ASC`
        ),

    updateStatus: (id, statut, commentaire) =>
        q('UPDATE document SET statut_verification = ?, commentaire_admin = ? WHERE id = ?', [
            statut,
            commentaire || null,
            id,
        ]),
};
