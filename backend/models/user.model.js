const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    findByEmail: (email) =>
        q('SELECT * FROM compte_connect WHERE email = ?', [email]),

    findById: (id) =>
        q('SELECT * FROM compte_connect WHERE id = ?', [id]),

    findByIdWithProfil: (id) =>
        q(
            `SELECT c.*, p.id as profil_id, p.type_profil, p.phoneNumber, p.profilePicture,
                    p.address, p.postalCode, p.city, p.profession, p.date_naissance
             FROM compte_connect c
             LEFT JOIN profil p ON c.id = p.compte_id
             WHERE c.id = ?`,
            [id]
        ),

    findWithProfil: (id) =>
        q(
            'SELECT c.*, p.profilePicture FROM compte_connect c LEFT JOIN profil p ON c.id = p.compte_id WHERE c.id = ?',
            [id]
        ),

    create: (firstName, lastName, email, hashedPassword, isVerified) =>
        q(
            `INSERT INTO compte_connect (firstName, lastName, email, password, role, consentement_rgpd, isVerified, passwordResetToken, createdAt, updatedAt, isBanned)
             VALUES (?, ?, ?, ?, 'user', 1, ?, null, NOW(), NOW(), 0)`,
            [firstName, lastName, email, hashedPassword, isVerified ? 1 : 0]
        ),

    createWithRole: (firstName, lastName, email, hashedPassword, role) =>
        q(
            `INSERT INTO compte_connect (firstName, lastName, email, password, role, consentement_rgpd, isVerified, passwordResetToken, createdAt, updatedAt, isBanned)
             VALUES (?, ?, ?, ?, ?, 1, 1, null, NOW(), NOW(), 0)`,
            [firstName, lastName, email, hashedPassword, role]
        ),

    createChild: (firstName, lastName, email, hashedPassword, parentId) =>
        q(
            `INSERT INTO compte_connect (firstName, lastName, email, password, role, consentement_rgpd, isVerified, passwordResetToken, createdAt, updatedAt, isBanned, is_minor, parent_id)
             VALUES (?, ?, ?, ?, 'user', 1, 1, null, NOW(), NOW(), 0, 1, ?)`,
            [firstName, lastName, email, hashedPassword, parentId]
        ),

    updateVerificationToken: (email, token) =>
        q(
            'UPDATE compte_connect SET verificationToken = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?',
            [token, email]
        ),

    findByVerificationToken: (token) =>
        q('SELECT * FROM compte_connect WHERE verificationToken = ?', [token]),

    verifyEmail: (token) =>
        q(
            'UPDATE compte_connect SET isVerified = 1, verificationToken = null, updatedAt = CURRENT_TIMESTAMP WHERE verificationToken = ?',
            [token]
        ),

    updatePasswordResetToken: (email, token) =>
        q('UPDATE compte_connect SET passwordResetToken = ? WHERE email = ?', [token, email]),

    findByResetToken: (token, uid) =>
        q('SELECT * FROM compte_connect WHERE passwordResetToken = ? AND id = ?', [token, uid]),

    findByResetTokenOnly: (token) =>
        q('SELECT * FROM compte_connect WHERE passwordResetToken = ?', [token]),

    resetPassword: (hashedPassword, token) =>
        q(
            'UPDATE compte_connect SET password = ?, passwordResetToken = null WHERE passwordResetToken = ?',
            [hashedPassword, token]
        ),

    updatePassword: (id, hashedPassword) =>
        q('UPDATE compte_connect SET password = ?, updatedAt = NOW() WHERE id = ?', [hashedPassword, id]),

    setMinorStatus: (id, isMinor) =>
        q('UPDATE compte_connect SET is_minor = ?, updatedAt = NOW() WHERE id = ?', [isMinor ? 1 : 0, id]),

    touchUpdatedAt: (id) =>
        q('UPDATE compte_connect SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [id]),

    getAll: () =>
        q('SELECT * FROM compte_connect'),

    getAllAdmin: (whereSql, values, limit, offset) =>
        q(
            `SELECT * FROM compte_connect ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        ),

    countAdmin: (whereSql, values) =>
        q(`SELECT COUNT(*) AS total FROM compte_connect ${whereSql}`, values),

    ban: (id) =>
        q('UPDATE compte_connect SET isBanned = 1 WHERE id = ?', [id]),

    unban: (id) =>
        q('UPDATE compte_connect SET isBanned = 0 WHERE id = ?', [id]),

    updateRole: (id, role) =>
        q('UPDATE compte_connect SET role = ?, updatedAt = NOW() WHERE id = ?', [role, id]),

    remove: (id) =>
        q('DELETE FROM compte_connect WHERE id = ?', [id]),

    findProfilByCompteId: (id) =>
        q('SELECT id FROM profil WHERE compte_id = ?', [id]),

    updateProfilFields: (setClauses, values, id) =>
        q(`UPDATE profil SET ${setClauses.join(', ')} WHERE compte_id = ?`, [...values, id]),
};
