module.exports = function requireVerified(req, res, next) {
    if (req.user?.scope !== 'full') {
        return res.status(403).json({ message: 'Vérifiez votre adresse e-mail pour accéder à cette fonctionnalité.' });
    }
    next();
};
