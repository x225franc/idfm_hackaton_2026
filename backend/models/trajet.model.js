const db = require('../config/db');

const q = (sql, values = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, values, (err, result) => (err ? reject(err) : resolve(result)))
    );

module.exports = {
    getByProfilId: (profilId) =>
        q(
            'SELECT id, station, ligne, direction, date_scan, type_scan FROM trajet WHERE profil_id = ? ORDER BY date_scan DESC',
            [profilId]
        ),
};
