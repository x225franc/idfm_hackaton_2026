const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    create: (compte_id, type, titre, message, forfait_id = null) =>
        q(
            `INSERT INTO notification (compte_id, type, titre, message, forfait_id)
             VALUES (?, ?, ?, ?, ?)`,
            [compte_id, type, titre, message, forfait_id]
        ),

    getByCompteId: (compte_id) =>
        q(
            'SELECT * FROM notification WHERE compte_id = ? ORDER BY createdAt DESC',
            [compte_id]
        ),

    countUnread: (compte_id) =>
        q(
            'SELECT COUNT(*) AS total FROM notification WHERE compte_id = ? AND lu = 0',
            [compte_id]
        ),

    markAllRead: (compte_id) =>
        q(
            'UPDATE notification SET lu = 1 WHERE compte_id = ? AND lu = 0',
            [compte_id]
        ),

    markOneRead: (id, compte_id) =>
        q(
            'UPDATE notification SET lu = 1 WHERE id = ? AND compte_id = ?',
            [id, compte_id]
        ),

    existsForForfait: (forfait_id, type) =>
        q(
            'SELECT id FROM notification WHERE forfait_id = ? AND type = ? LIMIT 1',
            [forfait_id, type]
        ),

    existsForCompteToday: (compte_id, type) =>
        q(
            `SELECT id FROM notification
             WHERE compte_id = ? AND type = ? AND DATE(createdAt) = CURDATE()
             LIMIT 1`,
            [compte_id, type]
        ),

    getForfaitsExpiringInDays: (days) =>
        q(
            `SELECT f.id AS forfait_id, f.type_forfait, f.date_fin,
                    p.compte_id, p.firstName, p.lastName,
                    cc.email
             FROM forfait f
             JOIN profil p ON f.porteur_id = p.id
             JOIN compte_connect cc ON p.compte_id = cc.id
             WHERE f.statut = 'Actif'
               AND f.date_fin IS NOT NULL
               AND DATEDIFF(f.date_fin, CURDATE()) = ?`,
            [days]
        ),

    getProfilesWithBirthdayAndAge: (age) =>
        q(
            `SELECT p.id AS profil_id, p.compte_id, p.firstName, p.lastName,
                    p.date_naissance, cc.email
             FROM profil p
             JOIN compte_connect cc ON p.compte_id = cc.id
             WHERE MONTH(p.date_naissance) = MONTH(CURDATE())
               AND DAY(p.date_naissance) = DAY(CURDATE())
               AND TIMESTAMPDIFF(YEAR, p.date_naissance, CURDATE()) = ?`,
            [age]
        ),
        
    getMinorsTurning16Today: () =>
        q(
            `SELECT p.id AS profil_id, p.compte_id, p.firstName, p.lastName, cc.email
             FROM profil p
             JOIN compte_connect cc ON p.compte_id = cc.id
             WHERE cc.is_minor = 1
               AND MONTH(p.date_naissance) = MONTH(CURDATE())
               AND DAY(p.date_naissance) = DAY(CURDATE())
               AND TIMESTAMPDIFF(YEAR, p.date_naissance, CURDATE()) = 16`
        ),
};
