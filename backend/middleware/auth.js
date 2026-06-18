const jwt = require('jsonwebtoken');

<<<<<<< HEAD
// Vérifie le JWT envoyé dans l'en-tête Authorization (format "Bearer <token>") et attache
// son contenu décodé à req.user. Utilisé par les routes qui doivent identifier l'utilisateur
// connecté côté serveur (ex: /api/family/*), plutôt que de faire confiance à un id fourni par le client.
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = header.slice('Bearer '.length);
=======
module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou invalide.' });
    }
    const token = authHeader.slice(7);
>>>>>>> dev
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
<<<<<<< HEAD
        return res.status(401).json({ message: 'Session invalide ou expirée' });
    }
};

module.exports = { verifyToken };
=======
        res.status(401).json({ message: 'Token expiré ou invalide.' });
    }
};
>>>>>>> dev
