const jwt = require('jsonwebtoken');

// Vérifie le JWT envoyé dans l'en-tête Authorization (format "Bearer <token>") et attache
// son contenu décodé à req.user. Utilisé par les routes qui doivent identifier l'utilisateur
// connecté côté serveur (ex: /api/family/*), plutôt que de faire confiance à un id fourni par le client.
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = header.slice('Bearer '.length);
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Session invalide ou expirée' });
    }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
