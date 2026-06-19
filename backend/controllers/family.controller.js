const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const profilModel = require('../models/profil.model');
const familyModel = require('../models/family.model');
const transporter = require('../config/mailer');
const EmailTemplate = require('../components/emailTemplate');

const logo = () => `${process.env.FRONTEND_URL}/components/logo.svg`;

const calculateAge = (birthDateStr) => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const generateTempPassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%&*?';
    const all = lower + upper + digits + special;

    const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
    const required = [pick(lower), pick(upper), pick(digits), pick(special)];
    const rest = Array.from({ length: 8 }, () => pick(all));

    return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
};

const sendChildWelcomeMail = (child, parentFirstName, tempPassword) => {
    const headerBar = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:25px;">
            <tr>
                <td bgcolor="#1972D2" align="center" style="background-color:#1972D2; padding:16px; border-radius:12px;">
                    <span style="color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:0.5px;">Comutitres</span>
                </td>
            </tr>
        </table>
    `;

    const html = EmailTemplate({
        url: process.env.FRONTEND_URL,
        text1: `${headerBar}<strong style="color: #0F172A; font-size: 18px;">Bonjour ${child.firstName} !</strong><br/>${parentFirstName} a créé un compte Comutitres pour vous.`,
        text2: `
            <div style="background-color: #F8FAFC; padding: 25px 20px; border-radius: 10px; border-left: 4px solid #1972D2; border: 1px solid #E2E8F0; margin-bottom: 20px;">
                <p style="margin: 0 0 12px 0; color: #0F172A; font-size: 15px;">Voici vos identifiants de connexion :</p>
                <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; border: 1px dashed #1972D2;">
                    <p style="margin: 0 0 6px 0; color: #475569; font-size: 13px;">Email</p>
                    <p style="margin: 0 0 14px 0; color: #0F172A; font-size: 15px; font-weight: bold;">${child.email}</p>
                    <p style="margin: 0 0 6px 0; color: #475569; font-size: 13px;">Mot de passe temporaire</p>
                    <p style="margin: 0; color: #0F172A; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${tempPassword}</p>
                </div>
            </div>
            <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
                Conformément au RGPD, ces données ne sont utilisées que pour la gestion de l'abonnement de transport.<br/>
                Changez votre mot de passe après connexion.
            </p>
        `,
        link: `<a href='${process.env.FRONTEND_URL}/login' target='_blank'>Accéder à mon compte →</a>`,
        logo: logo(),
        mail: process.env.MAIL_USER,
    });

    transporter.sendMail({ from: process.env.MAIL_USER, to: child.email, subject: 'Votre compte Comutitres a été créé', html }, () => {});
};

const addChild = async (req, res) => {
    if (req.user.is_minor)
        return res.status(403).json({ message: 'Un compte mineur ne peut pas ajouter de proche.' });

    const { firstName, lastName, birthDate, email } = req.body;
    const parentId = req.user.id_user;

    if (!firstName || !lastName || !birthDate || !email)
        return res.status(400).json({ message: 'Champs manquants' });

    if (calculateAge(birthDate) >= 16)
        return res.status(400).json({ message: "Ce compte est réservé aux proches de moins de 16 ans." });

    try {
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const result = await userModel.createChild(firstName, lastName, email, hashedPassword, parentId);
        const childId = result.insertId;

        const profilResult = await profilModel.create({
            compte_id: childId,
            type_profil: 'Porteur',
            firstName,
            lastName,
            date_naissance: birthDate,
            profession: null,
            phoneNumber: null,
            address: null,
            postalCode: null,
            city: null,
        });
        const childProfilId = profilResult.insertId;

        await familyModel.insertLinkedAccount(parentId, childId, 'enfant');

        sendChildWelcomeMail({ firstName, email }, req.user.firstName, tempPassword);

        res.status(201).json({
            message: 'Compte enfant créé avec succès',
            child: { id: childId, profilId: childProfilId, firstName, lastName, email },
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' });
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getChildren = async (req, res) => {
    try {
        const rows = await familyModel.getChildrenByParentId(req.user.id_user);
        const children = rows.map((r) => ({
            id: r.id,
            profilId: r.profilId,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            birthDate: r.birthDate,
            activeSubscription: r.subscription_type ? {
                type_forfait: r.subscription_type,
                statut: r.subscription_statut,
                date_debut: r.subscription_date_debut,
                date_fin: r.subscription_date_fin,
            } : null,
        }));
        res.json(children);
    } catch {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { addChild, getChildren };
