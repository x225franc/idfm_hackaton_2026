const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const transporter = require("../config/mailer");
const EmailTemplate = require("../components/emailTemplate");
const crypto = require("crypto");

const backendUrl = process.env.BACKEND_URL;
const logo = `${process.env.BACKEND_URL}/components/logo.png`;

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
    consentement_rgpd: user.consentement_rgpd
});

// route pour se connecter
router.post("/api/login", async (req, res) => {
	try {
        const loginEmail = req.body.emailOrUsername || req.body.email;

		if (!loginEmail || !req.body.password) {
			return res.status(400).json({ message: "Identifiants manquants." });
		}

		// Recuperer l'utilisateur avec l'email dans compte_connect
		const rek = "SELECT * FROM compte_connect WHERE email = ?";
		db.query(
			rek,
			[loginEmail],
			async (err, result) => {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Erreur serveur" });
				}

				if (result.length === 0) {
					return res.status(401).json({
						message: "L'identifiant ou le mot de passe est incorrect.",
					});
				}

				const user = result[0];
				const hashedPassword = user.password;
				const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

				if (passwordMatch) {
					if (user.isVerified === 0) {
						const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
						const saveTokenRek = "UPDATE compte_connect SET verificationToken = ? WHERE email = ?";
						
                        db.query(
							saveTokenRek,
							[verificationToken, user.email],
							(err, result) => {
								if (err) {
									console.log(err);
									return res.status(500).json({ message: "Erreur serveur" });
								}

								res.status(401).json({
									message: "Votre compte n'est pas encore vérifié. Un nouveau lien vous a été envoyé par mail.",
									email: user.email,
									isVerified: "NO",
								});

								const emailTemplate = EmailTemplate({
									url: `${process.env.FRONTEND_URL}`,
									text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez comutitres_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
									text2: `
									<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #0050AA; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
										<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">Veuillez saisir le code de validation ci-dessous :</p>
										<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #0050AA; display: inline-block; margin-bottom: 15px;">
											<span style="font-size: 28px; font-weight: bold; color: #0050AA; letter-spacing: 6px;">${verificationToken}</span>
										</div>
										<p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">Ce code est personnel et confidentiel.<br/>Une fois votre compte confirmé, vous pourrez utiliser l'intégralité de nos services.</p>
									</div>
								`,
									link: "",
									logo: logo,
									mail: process.env.MAIL_USER,
								});

								transporter.sendMail({
									from: process.env.MAIL_USER,
									to: user.email,
									subject: "comutitres_hackaton_2026 - Vérification Email",
									html: emailTemplate,
								}, (err, info) => {
									if (err) console.log("Erreur envoi email vérification:", err);
								});
							}
						);
					} else {
						if (user.isBanned === 1) {
							return res.status(401).json({
								message: "Votre compte a été banni. Veuillez contacter le service client comutitres_hackaton_2026 pour plus d'informations.",
							});
						} else {
							const updateQuery = "UPDATE compte_connect SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?";
							db.query(updateQuery, [user.id], (err) => {
								if (err) console.log(err);
							});

							const token = jwt.sign(buildJwtPayload(user), process.env.JWT_SECRET, { expiresIn: "24h" });

							res.json({
								message: "Connexion réussie",
								jwt: token,
								user,
								responseStatus: "success",
							});
						}
					}
				} else {
					return res.status(401).json({ message: "L'email ou le mot de passe est incorrect." });
				}
			}
		);
	} catch (error) {
		console.error("Erreur lors de la connexion :", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

// route pour ajouter un compte connect (inscription)
router.post("/api/add/user", async (req, res) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 10);
	const values = [
		req.body.firstName,
		req.body.lastName,
		req.body.email,
		hashedPassword
	];
	const rek = "INSERT INTO compte_connect (firstName, lastName, email, password, role, consentement_rgpd, isVerified, passwordResetToken, createdAt, updatedAt, isBanned) VALUES (?, ?, ?, ?, 'user', 1, 0, null, NOW(), NOW(), 0)";
	
    db.query(rek, values, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			res.status(200).json({ message: "Utilisateur ajouté avec succès", user: result });
		}
	});
});

// Route pour l'authentification via Google
router.post("/api/auth/google", async (req, res) => {
	const { token } = req.body;

	if (!token) return res.status(400).json({ message: "Token manquant" });

	try {
		const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!googleResponse.ok) return res.status(401).json({ message: "Token Google invalide" });

		const userData = await googleResponse.json();
		const email = userData.email;
		const firstName = userData.given_name;
		const lastName = userData.family_name;

		db.query("SELECT * FROM compte_connect WHERE email = ?", [email], async (err, results) => {
			if (err) return res.status(500).json({ message: "Erreur serveur de base de données" });

			if (results.length > 0) {
				const user = results[0];
				const tokenJWT = jwt.sign(buildJwtPayload(user), process.env.JWT_SECRET, { expiresIn: "7d" });
				return res.status(200).json({ message: "Connexion réussie", jwt: tokenJWT });
			} else {
				const randomPassword = crypto.randomBytes(16).toString("hex");
				const hashedPassword = await bcrypt.hash(randomPassword, 10);

				const insertQuery = `INSERT INTO compte_connect (firstName, lastName, email, password, role, consentement_rgpd, isVerified, createdAt, updatedAt, isBanned) VALUES (?, ?, ?, ?, 'user', 1, 1, NOW(), NOW(), 0)`;
				const values = [firstName, lastName, email, hashedPassword];

				db.query(insertQuery, values, (err, result) => {
					if (err) return res.status(500).json({ message: "Erreur lors de la création du compte" });

					db.query("SELECT * FROM compte_connect WHERE id = ?", [result.insertId], (fetchErr, createdRows) => {
						if (fetchErr || createdRows.length === 0) return res.status(500).json({ message: "Erreur lors de la création du compte" });

						const createdUser = createdRows[0];
						const tokenJWT = jwt.sign(buildJwtPayload(createdUser), process.env.JWT_SECRET, { expiresIn: "7d" });

						return res.status(200).json({ message: "Inscription réussie", jwt: tokenJWT });
					});
				});
			}
		});
	} catch (error) {
		console.error("Erreur serveur Google Auth:", error);
		res.status(500).json({ message: "Erreur interne du serveur" });
	}
});

// route pour verifier un email
router.post("/api/verify-email", (req, res) => {
	const token = req.query.token;
	if (token) {
		const rek = "SELECT * FROM compte_connect WHERE verificationToken = ?";
		db.query(rek, token, (err, result) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Erreur serveur" });
			} else {
				if (result.length === 0) {
					res.status(404).json({ message: "Token non trouvé" });
				} else {
					const activateAccountRek = "UPDATE compte_connect SET isVerified = 1, verificationToken = null, updatedAt = CURRENT_TIMESTAMP WHERE verificationToken = ?";
					db.query(activateAccountRek, token, (err, result) => {
						if (err) {
							console.log(err);
							res.status(500).json({ message: "Erreur serveur" });
						} else {
							res.status(200).json({ message: "Compte activé" });
						}
					});
				}
			}
		});
	} else {
		res.status(400).json({ message: "Token non trouvé" });
	}
});

// route pour envoyer un mail de verification de compte
router.post("/api/send-verification-email", async (req, res) => {
	const rek = "SELECT * FROM compte_connect WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			if (result.length === 0) {
				res.status(404).json({ message: "Utilisateur non trouvé" });
			} else {
				const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
				const saveTokenRek = "UPDATE compte_connect SET verificationToken = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?";
				
                db.query(saveTokenRek, [verificationToken, req.body.email], (err, updateResult) => {
					if (err) {
						console.log(err);
						res.status(500).json({ message: "Erreur serveur" });
					} else {
						const emailTemplate = EmailTemplate({
							url: `${process.env.FRONTEND_URL}`,
							text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez comutitres_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
							text2: `
								<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #0050AA; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
									<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">Veuillez saisir le code de validation ci-dessous :</p>
									<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #0050AA; display: inline-block; margin-bottom: 15px;">
										<span style="font-size: 28px; font-weight: bold; color: #0050AA; letter-spacing: 6px;">${verificationToken}</span>
									</div>
								</div>
							`,
							link: "",
							logo: logo,
							mail: process.env.MAIL_USER,
						});

						res.status(200).json({ message: "Mail envoyé avec succès" });

						transporter.sendMail({
							from: process.env.MAIL_USER,
							to: req.body.email,
							subject: "comutitres_hackaton_2026 - Vérification Email",
							html: emailTemplate,
						}, (err, info) => {
							if (err) console.log("Erreur envoi email:", err);
						});
					}
				});
			}
		}
	});
});

// route pour renvoyer un mail de verification de compte (identique)
router.post("/api/resend-verification-email", async (req, res) => {
	const rek = "SELECT * FROM compte_connect WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (result.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
		
        const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
		const saveTokenRek = "UPDATE compte_connect SET verificationToken = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?";
		
        db.query(saveTokenRek, [verificationToken, req.body.email], (err, updateResult) => {
			if (err) return res.status(500).json({ message: "Erreur serveur" });
			
			const emailTemplate = EmailTemplate({
                url: `${process.env.FRONTEND_URL}`,
				text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez comutitres_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
				text2: `
					<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #0050AA; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
						<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">Veuillez saisir le code de validation ci-dessous :</p>
						<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #0050AA; display: inline-block; margin-bottom: 15px;">
							<span style="font-size: 28px; font-weight: bold; color: #0050AA; letter-spacing: 6px;">${verificationToken}</span>
						</div>
					</div>
				`,
				link: "",
				logo: logo,
				mail: process.env.MAIL_USER,
            });
			res.status(200).json({ message: "Mail envoyé avec succès" });

			transporter.sendMail({
				from: process.env.MAIL_USER,
				to: req.body.email,
				subject: "comutitres_hackaton_2026 - Vérification Email",
				html: emailTemplate,
			}, (err) => { if (err) console.log(err); });
		});
	});
});

// route pour demander recuperation de son mot de passe
router.post("/api/forgot-password", async (req, res) => {
	const rek = "SELECT * FROM compte_connect WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (result.length === 0) return res.status(404).json({ message: "Ce compte utilisateur n'existe pas" });
		
        const passwordResetToken = Math.random().toString(36).substring(2, 17);
		const uid = result[0].id;

		const saveTokenRek = "UPDATE compte_connect SET passwordResetToken = ? WHERE email = ?";
		db.query(saveTokenRek, [passwordResetToken, req.body.email], (err, updateResult) => {
			if (err) return res.status(500).json({ message: "Erreur serveur" });
			
			const emailTemplate = EmailTemplate({
				url: `${process.env.FRONTEND_URL}`,
				text1: `<strong style="color: #f8fafc; font-size: 18px;">Réinitialisation de mot de passe</strong>`,
				text2: `Pour choisir un nouveau mot de passe, cliquez sur le bouton ci-dessous.`,
				link: `<a href='${process.env.FRONTEND_URL}/signin/modifypw?token=${passwordResetToken}&uid=${uid}' target='_blank'>Réinitialiser mon mot de passe</a>`,
				logo: logo,
				mail: process.env.MAIL_USER,
			});

			res.status(200).json({ message: "Mail envoyé avec succès" });

			transporter.sendMail({
				from: process.env.MAIL_USER,
				to: req.body.email,
				subject: "comutitres_hackaton_2026 - Réinitialisation",
				html: emailTemplate,
			}, (err) => { if(err) console.log(err); });
		});
	});
});

// route pour juste recuperer le token
router.get("/api/reset-password", (req, res) => {
	const token = req.query.token;
	const uid = req.query.uid;
	if (token) {
		const rek = "SELECT * FROM compte_connect WHERE passwordResetToken = ? AND id = ?";
		db.query(rek, [token, uid], (err, result) => {
			if (err) return res.status(500).json({ message: "Erreur serveur" });
			if (result.length === 0) return res.status(404).json({ message: "Token non trouvé" });
			res.status(200).json({ message: "Token trouvé", token: result[0].passwordResetToken });
		});
	} else {
		res.status(400).json({ message: "Token non trouvé" });
	}
});

// route pour reinitialiser son mot de passe
router.post("/api/reset-password", async (req, res) => {
	const token = req.query.token;
	if (token) {
		const rek = "SELECT * FROM compte_connect WHERE passwordResetToken = ?";
		db.query(rek, token, async (err, result) => {
			if (err) return res.status(500).json({ message: "Erreur serveur" });
			if (result.length === 0) return res.status(404).json({ message: "Token non trouvé" });
			
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
			const resetPasswordRek = "UPDATE compte_connect SET password = ?, passwordResetToken = null WHERE passwordResetToken = ?";
			
            db.query(resetPasswordRek, [hashedPassword, token], (err, updateResult) => {
				if (err) return res.status(500).json({ message: "Erreur serveur" });
				res.status(200).json({ message: "Mot de passe réinitialisé" });
			});
		});
	} else {
		res.status(400).json({ message: "Token non trouvé" });
	}
});

module.exports = router;