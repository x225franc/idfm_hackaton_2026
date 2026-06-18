const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const transporter = require('../config/mailer');
const EmailTemplate = require('../components/emailTemplate');

const logo = () => `${process.env.BACKEND_URL}/components/logo.svg`;

const buildJwtPayload = (user) => ({
    id_user: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isBanned: user.isBanned,
    consentement_rgpd: user.consentement_rgpd,
    is_minor: !!user.is_minor,
});

// Envoi du mail de bienvenue (depuis le login d'un compte non vérifié)
const sendWelcomeMail = (email, token) => {
    const html = EmailTemplate({
        url: process.env.FRONTEND_URL,
        text1: `<strong style="color: #0F172A; font-size: 18px;">Bienvenue chez Comutitres !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
        text2: `
            <div style="background-color: #F8FAFC; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #0050AA; margin-bottom: 20px; border: 1px solid #E2E8F0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #0F172A; font-size: 16px;">Veuillez saisir le code de validation ci-dessous :</p>
                <div style="background-color: #FFFFFF; padding: 15px 25px; border-radius: 8px; border: 1px dashed #0050AA; display: inline-block; margin-bottom: 15px;">
                    <span style="font-size: 28px; font-weight: bold; color: #0050AA; letter-spacing: 6px;">${token}</span>
                </div>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">Ce code est personnel et confidentiel.<br/>Une fois votre compte confirmé, vous pourrez utiliser l'intégralité de nos services.</p>
            </div>
        `,
        link: '',
        logo: logo(),
        mail: process.env.MAIL_USER,
    });
    transporter.sendMail({ from: process.env.MAIL_USER, to: email, subject: 'Comutitres - Code de Vérification', html }, () => {});
};

// Envoi du mail de vérification (renvoi / send)
const sendVerificationMail = (email, token) => {
    const html = EmailTemplate({
        url: process.env.FRONTEND_URL,
        text1: `<strong style="color: #0F172A; font-size: 18px;">Vérification de votre compte Comutitres</strong>`,
        text2: `
            <div style="background-color: #F8FAFC; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #0050AA; margin-bottom: 20px; border: 1px solid #E2E8F0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #0F172A; font-size: 16px;">Veuillez saisir le code de validation ci-dessous :</p>
                <div style="background-color: #FFFFFF; padding: 15px 25px; border-radius: 8px; border: 1px dashed #0050AA; display: inline-block; margin-bottom: 15px;">
                    <span style="font-size: 28px; font-weight: bold; color: #0050AA; letter-spacing: 6px;">${token}</span>
                </div>
            </div>
        `,
        link: '',
        logo: logo(),
        mail: process.env.MAIL_USER,
    });
    transporter.sendMail({ from: process.env.MAIL_USER, to: email, subject: 'Comutitres - Code de Vérification', html }, () => {});
};

const login = async (req, res) => {
    try {
        const loginEmail = req.body.emailOrUsername || req.body.email;
        if (!loginEmail || !req.body.password)
            return res.status(400).json({ message: 'Identifiants manquants.' });

        const rows = await userModel.findByEmail(loginEmail);
        if (rows.length === 0)
            return res.status(401).json({ message: "L'identifiant ou le mot de passe est incorrect." });

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch)
            return res.status(401).json({ message: "L'email ou le mot de passe est incorrect." });

        if (user.isVerified === 0) {
            const token = Math.random().toString(36).substring(2, 8).toUpperCase();
            try { await userModel.updateVerificationToken(user.email, token); } catch { return res.status(500).json({ message: 'Erreur serveur' }); }
            res.status(401).json({ message: "Votre compte n'est pas encore vérifié.", email: user.email, isVerified: 'NO' });
            sendWelcomeMail(user.email, token);
            return;
        }

        if (user.isBanned === 1)
            return res.status(401).json({ message: 'Votre compte a été banni. Veuillez contacter le service client.' });

        await userModel.touchUpdatedAt(user.id);
        const jwtToken = jwt.sign(buildJwtPayload(user), process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Connexion réussie', jwt: jwtToken, user, responseStatus: 'success' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const result = await userModel.create(req.body.firstName, req.body.lastName, req.body.email, hashedPassword, false);
        res.status(200).json({ message: 'Utilisateur ajouté avec succès', user: result });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' });
        }
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const registerOnboarding = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const result = await userModel.create(req.body.firstName, req.body.lastName, req.body.email, hashedPassword, false);
        res.status(200).json({ message: 'Utilisateur ajouté avec succès', user: result });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' });
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const googleAuth = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token manquant' });

    try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!googleRes.ok) return res.status(401).json({ message: 'Token Google invalide' });

        const { email, given_name: firstName, family_name: lastName } = await googleRes.json();

        const rows = await userModel.findByEmail(email);
        if (rows.length > 0) {
            const user = rows[0];
            const tokenJWT = jwt.sign(buildJwtPayload(user), process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ message: 'Connexion réussie', jwt: tokenJWT });
        }

        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const result = await userModel.create(firstName, lastName, email, hashedPassword, true);

        const created = await userModel.findById(result.insertId);
        if (created.length === 0) return res.status(500).json({ message: 'Erreur lors de la création du compte' });

        const tokenJWT = jwt.sign(buildJwtPayload(created[0]), process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Inscription réussie', jwt: tokenJWT });
    } catch {
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

const verifyEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).json({ message: 'Token non trouvé' });

    try {
        const rows = await userModel.findByVerificationToken(token);
        if (rows.length === 0) return res.status(404).json({ message: 'Code invalide ou expiré.' });
        await userModel.verifyEmail(token);
        res.status(200).json({ message: 'Compte activé' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const sendVerificationEmail = async (req, res) => {
    try {
        const rows = await userModel.findByEmail(req.body.email);
        if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const token = Math.random().toString(36).substring(2, 8).toUpperCase();
        await userModel.updateVerificationToken(req.body.email, token);
        res.status(200).json({ message: 'Mail envoyé avec succès' });
        sendVerificationMail(req.body.email, token);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const rows = await userModel.findByEmail(req.body.email);
        if (rows.length === 0) return res.status(404).json({ message: "Ce compte utilisateur n'existe pas" });

        const user = rows[0];
        const resetToken = Math.random().toString(36).substring(2, 17);
        await userModel.updatePasswordResetToken(req.body.email, resetToken);

        const html = EmailTemplate({
            url: process.env.FRONTEND_URL,
            text1: `<strong style="color: #0F172A; font-size: 18px;">Réinitialisation de mot de passe</strong>`,
            text2: `Pour choisir un nouveau mot de passe sécurisé, cliquez sur le bouton ci-dessous.`,
            link: `<a href='${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&uid=${user.id}' target='_blank'>Réinitialiser mon mot de passe</a>`,
            logo: logo(),
            mail: process.env.MAIL_USER,
        });

        res.status(200).json({ message: 'Mail envoyé avec succès' });
        transporter.sendMail({ from: process.env.MAIL_USER, to: req.body.email, subject: 'Comutitres - Réinitialisation', html }, () => {});
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getResetPassword = async (req, res) => {
    const { token, uid } = req.query;
    if (!token) return res.status(400).json({ message: 'Token non trouvé' });

    try {
        const rows = await userModel.findByResetToken(token, uid);
        if (rows.length === 0) return res.status(404).json({ message: 'Token non trouvé' });
        res.status(200).json({ message: 'Token trouvé', token: rows[0].passwordResetToken });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token non trouvé' });

    try {
        const rows = await userModel.findByResetTokenOnly(token);
        if (rows.length === 0) return res.status(404).json({ message: 'Token non trouvé' });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await userModel.resetPassword(hashedPassword, token);
        res.status(200).json({ message: 'Mot de passe réinitialisé' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    login,
    register,
    registerOnboarding,
    googleAuth,
    verifyEmail,
    sendVerificationEmail,
    forgotPassword,
    getResetPassword,
    resetPassword,
};
