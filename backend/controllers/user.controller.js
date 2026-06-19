const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const userModel = require('../models/user.model');
const profilModel = require('../models/profil.model');
const documentModel = require('../models/document.model');
const forfaitModel = require('../models/forfait.model');
const paiementModel = require('../models/paiement.model');
const transporter = require('../config/mailer');
const EmailTemplate = require('../components/emailTemplate');

const logo = () => `${process.env.FRONTEND_URL}/components/logo.svg`;

const getAll = async (req, res) => {
    try {
        const result = await userModel.getAll();
        res.json(result);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllAdmin = async (req, res) => {
    try {
        const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
        const offset = Math.max(0, Number(req.query.offset) || 0);
        const q = req.query.q ? String(req.query.q).trim() : '';
        const role = req.query.role ? String(req.query.role).trim() : '';
        const status = req.query.status ? String(req.query.status).trim() : '';

        const where = ['id != 1', 'id != 2'];
        const values = [];

        if (role === 'admin' || role === 'user') { where.push('role = ?'); values.push(role); }
        if (status === 'active') where.push('isBanned = 0');
        else if (status === 'banned') where.push('isBanned = 1');
        if (q) {
            where.push('(email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)');
            const pattern = `%${q}%`;
            values.push(pattern, pattern, pattern);
        }

        const whereSql = `WHERE ${where.join(' AND ')}`;
        const [items, countResult] = await Promise.all([
            userModel.getAllAdmin(whereSql, values, limit, offset),
            userModel.countAdmin(whereSql, values),
        ]);

        res.json({ items, total: countResult[0].total, limit, offset });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Création directe d'un compte depuis le backoffice (admin choisit le rôle, compte pré-vérifié).
const adminCreate = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password)
        return res.status(400).json({ message: 'Champs manquants' });
    if (!['admin', 'user'].includes(role))
        return res.status(400).json({ message: 'Rôle invalide' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await userModel.createWithRole(firstName, lastName, email, hashedPassword, role);
        res.status(201).json({ message: 'Utilisateur créé avec succès', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' });
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Vue détaillée d'un compte pour le backoffice : profil(s), documents, forfaits et paiements
// rattachés à TOUS les profils de ce compte (un compte peut porter plusieurs profils, ex. un
// payeur gérant aussi le profil d'un proche accompagné).
const getFullDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const userRows = await userModel.findById(id);
        if (userRows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const profils = await profilModel.getByCompteId(id);
        const profilIds = profils.map((p) => p.id);

        const [documents, forfaits, paiements] = await Promise.all([
            documentModel.getByProfilIds(profilIds),
            forfaitModel.getByPorteurIds(profilIds),
            paiementModel.getByPayeurIds(profilIds),
        ]);

        const { password, verificationToken, passwordResetToken, ...user } = userRows[0];
        res.json({ user, profils, documents, forfaits, paiements });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getById = async (req, res) => {
    if (parseInt(req.params.id) !== req.user.id_user)
        return res.status(403).json({ message: 'Accès refusé' });
    try {
        const rows = await userModel.findByIdWithProfil(req.params.id);
        if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const user = rows[0];
        res.json({
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
            profil_id: user.profil_id || null,
            phoneNumber: user.phoneNumber || null,
            address: user.address || null,
            postalCode: user.postalCode || null,
            city: user.city || null,
            profession: user.profession || null,
            date_naissance: user.date_naissance || null,
            profilePicture: user.profilePicture ? process.env.BACKEND_URL + user.profilePicture : null,
        });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) !== req.user.id_user)
        return res.status(403).json({ message: 'Accès refusé' });
    try {
        const rows = await userModel.findWithProfil(id);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = rows[0];

        if (req.body.password && req.body.password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await userModel.updatePassword(id, hashedPassword);
        } else {
            await userModel.touchUpdatedAt(id);
        }

        let images = null;
        if (req.files && req.files.length > 0) {
            const oldImagePath = 'uploads' + user.profilePicture;
            if (user.profilePicture && fs.existsSync(oldImagePath)) fs.unlink(oldImagePath, () => {});

            const file = req.files[0];
            const imagePath = 'uploads/images/user/user-' + path.parse(file.filename).name + '.png';
            if (!fs.existsSync('uploads/images/user')) fs.mkdirSync('uploads/images/user', { recursive: true });
            await sharp(file.path).resize({ width: 300, height: 300, fit: 'cover' }).png({ quality: 80 }).toFile(imagePath);
            images = imagePath.replace('uploads', '');
            fs.unlink(file.path, () => {});
        }

        const profilRows = await userModel.findProfilByCompteId(id);
        if (profilRows.length > 0) {
            const setClauses = [];
            const values = [];
            if (images !== null) { setClauses.push('profilePicture = ?'); values.push(images); }
            if (req.body.address !== undefined) { setClauses.push('address = ?'); values.push(req.body.address || null); }
            if (req.body.postalCode !== undefined) { setClauses.push('postalCode = ?'); values.push(req.body.postalCode || null); }
            if (req.body.city !== undefined) { setClauses.push('city = ?'); values.push(req.body.city || null); }
            if (req.body.phoneNumber !== undefined) {
                const phone = req.body.phoneNumber ? String(req.body.phoneNumber).replace(/\s/g, '') : null;
                if (phone && !/^0[1-9][0-9]{8}$/.test(phone))
                    return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
                setClauses.push('phoneNumber = ?'); values.push(phone || null);
            }
            const wantsIdentityUpdate = ['firstName', 'lastName', 'date_naissance'].some(f => req.body[f] !== undefined);
            if (wantsIdentityUpdate) {
                const docs = await documentModel.getByProfilId(profilRows[0].id);
                const identityLocked = docs.some(
                    d => d.type_document === "Pièce d'identité" && d.statut_verification === 'Validé'
                );
                if (identityLocked)
                    return res.status(403).json({ message: "Identité verrouillée — votre pièce d'identité a déjà été validée." });
            }
            if (req.body.firstName !== undefined) { setClauses.push('firstName = ?'); values.push(req.body.firstName || null); }
            if (req.body.lastName !== undefined) { setClauses.push('lastName = ?'); values.push(req.body.lastName || null); }
            if (req.body.date_naissance !== undefined) { setClauses.push('date_naissance = ?'); values.push(req.body.date_naissance || null); }
            if (setClauses.length > 0) await userModel.updateProfilFields(setClauses, values, id);
        }

        res.status(200).json({ message: 'Mise à jour traitée avec succès.' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const ban = async (req, res) => {
    const { id } = req.params;
    try {
        await userModel.ban(id);
    } catch {
        return res.status(500).json({ message: 'Erreur serveur' });
    }

    res.status(200).json({ message: 'Utilisateur banni !' });

    try {
        const rows = await userModel.findById(id);
        if (rows.length === 0) return;
        const html = EmailTemplate({
            url: process.env.FRONTEND_URL,
            text1: `<strong style="color: #ef4444; font-size: 18px;">Suspension de compte</strong>`,
            text2: `L'accès à votre compte Comutitres a été temporairement révoqué.`,
            link: `<a href="mailto:${process.env.MAIL_USER}">Contacter le support</a>`,
            logo: logo(),
            mail: process.env.MAIL_USER,
        });
        transporter.sendMail({ from: process.env.MAIL_USER, to: rows[0].email, subject: 'Comutitres - Compte suspendu', html }, () => {});
    } catch {}
};

const unban = async (req, res) => {
    const { id } = req.params;
    try {
        await userModel.unban(id);
    } catch {
        return res.status(500).json({ message: 'Erreur serveur' });
    }

    res.json({ message: 'Utilisateur rétabli !' });

    try {
        const rows = await userModel.findById(id);
        if (rows.length === 0) return;
        const html = EmailTemplate({
            url: process.env.FRONTEND_URL,
            text1: `<strong style="color: #0050AA; font-size: 18px;">Excellente nouvelle !</strong>`,
            text2: `Votre compte Comutitres a été entièrement rétabli. Vous pouvez de nouveau accéder à l'ensemble de vos services.`,
            link: `<a href="${process.env.FRONTEND_URL}/login">Me connecter</a>`,
            logo: logo(),
            mail: process.env.MAIL_USER,
        });
        transporter.sendMail({ from: process.env.MAIL_USER, to: rows[0].email, subject: 'Comutitres - Compte rétabli', html }, () => {});
    } catch {}
};

const updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['admin', 'user'].includes(role))
        return res.status(400).json({ message: 'Rôle invalide' });

    try {
        const result = await userModel.updateRole(id, role);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json({ message: 'Rôle modifié avec succès' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await userModel.findById(id);
        if (rows.length === 0) return res.status(404).json({ message: 'Compte introuvable' });
        const email = rows[0].email;
        await userModel.remove(id);

        res.status(200).json({ message: 'Compte et données associées supprimés conformément au RGPD' });

        const html = EmailTemplate({
            url: process.env.FRONTEND_URL,
            text1: `<strong style="color: #ef4444; font-size: 18px;">Suppression de votre compte</strong>`,
            text2: `Conformément au RGPD et à votre demande, l'intégralité de vos données personnelles a été effacée de nos serveurs. Nous sommes désolés de vous voir partir !`,
            link: '',
            logo: logo(),
            mail: process.env.MAIL_USER,
        });
        transporter.sendMail({ from: process.env.MAIL_USER, to: email, subject: 'Comutitres - Suppression de compte confirmée', html }, () => {});
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getAll, getAllAdmin, getById, adminCreate, getFullDetail, update, ban, unban, updateRole, remove };
