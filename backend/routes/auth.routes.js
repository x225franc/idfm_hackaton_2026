const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const transporter = require("../config/mailer");
const EmailTemplate = require("../components/emailTemplate");
const crypto = require("crypto");

// logo idfm_hackaton_2026
const backendUrl = process.env.BACKEND_URL;
const logo = `${process.env.BACKEND_URL}/components/idfm_hackaton_2026/logo.png`;

const buildJwtPayload = (user) => ({
	id_user: user.id,
	username: user.username,
	firstName: user.firstName,
	lastName: user.lastName,
	email: user.email,
	role: user.role,
	phoneNumber: user.phoneNumber,
	profilePicture:
		user.profilePicture !== null && user.profilePicture !== undefined
			? backendUrl + user.profilePicture
			: null,
	isVerified: user.isVerified,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
	isBanned: user.isBanned,
	address: user.address,
	postalCode: user.postalCode,
	city: user.city,
});

// route pour se connecter
router.post("/api/login", async (req, res) => {
	try {
		if (!req.body.emailOrUsername || !req.body.password) {
			return res.status(400).json({ message: "Identifiants manquants." });
		}

		// Recuperer l'utilisateur avec l'email ou le username
		const rek = "SELECT * FROM user WHERE email = ? OR username = ?";
		db.query(
			rek,
			[req.body.emailOrUsername, req.body.emailOrUsername],
			async (err, result) => {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: "Erreur serveur" });
				}

				// Si l'utilisateur n'existe pas
				if (result.length === 0) {
					return res.status(401).json({
						message: "L'identifiant ou le mot de passe est incorrect.",
					});
				}

				// L'utilisateur existe
				const user = result[0];

				// Recuperer le mot de passe haché de la base de données
				const hashedPassword = user.password;

				// Comparer le mot de passe haché avec le mot de passe envoyé dans la requête
				const passwordMatch = await bcrypt.compare(
					req.body.password,
					hashedPassword,
				);

				if (passwordMatch) {
					// verifier si le compte est verifié
					if (user.isVerified === 0) {
						// renvoyer un mail de verification si le compte n'est pas verifié

						// creation d'un nouveau token de verification
						const verificationToken = Math.random()
							.toString(36)
							.substring(2, 8)
							.toUpperCase();

						// Sauvegarder le token de verification dans la base de données
						const saveTokenRek =
							"UPDATE user SET verificationToken = ? WHERE email = ? OR username = ?";
						db.query(
							saveTokenRek,
							[verificationToken, user.email, user.username],

							(err, result) => {
								if (err) {
									console.log(err);
									return res.status(500).json({ message: "Erreur serveur" });
								}

								// Envoyer la réponse d'abord
								res.status(401).json({
									message:
										"Votre compte n'est pas encore vérifié. Un nouveau lien vous a été envoyé par mail.",
									email: user.email,
									isVerified: "NO",
								});

								// Transporter gestion mail
								const emailTemplate = EmailTemplate({
									url: `${process.env.FRONTEND_URL}`,
									text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez idfm_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
									text2: `
									<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #FB5012; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
										<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">
											Veuillez saisir le code de validation ci-dessous :
										</p>
										
										<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #FB5012; display: inline-block; margin-bottom: 15px;">
											<span style="font-size: 28px; font-weight: bold; color: #FB5012; letter-spacing: 6px;">${verificationToken}</span>
										</div>

										<p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
											Ce code est personnel et confidentiel.<br/>Une fois votre compte confirmé, vous pourrez utiliser l'intégralité de nos services.
										</p>
									</div>
								`,
									link: "", // On laisse vide car il n'y a pas de bouton à cliquer, juste un code à copier
									logo: logo,
									mail: process.env.MAIL_USER,
								});

								const mailOptions = {
									from: process.env.MAIL_USER,
									to: user.email,
									subject: "idfm_hackaton_2026 - Vérification Email",
									html: emailTemplate,
								};

								transporter.sendMail(mailOptions, (err, info) => {
									if (err) {
										console.log("Erreur envoi email vérification:", err);
									} else {
										console.log("Email vérification envoyé:", info);
									}
								});
							},
						);
					} else {
						if (user.isBanned === 1) {
							return res.status(401).json({
								message:
									"Votre compte a été banni. Veuillez contacter le service client idfm_hackaton_2026 pour plus d'informations.",
							});
						} else {
							// Mots de passe correspondent, authentification réussie

							// Update the updatedAt field
							const updateQuery =
								"UPDATE user SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?";
							db.query(updateQuery, [user.id], (err, result) => {
								if (err) {
									console.log(err);
									return res.status(500).json({ message: "Erreur serveur" });
								}
							});

							// Generer un token JWT
							const token = jwt.sign(
								buildJwtPayload(user),
								process.env.JWT_SECRET,
								{ expiresIn: "24h" },
							);

							// Envoyer la réponse avec le token et les informations de l'utilisateur
							res.json({
								message: "Connexion réussie",
								jwt: token,
								user,
								responseStatus: "success",
							});
						}
					}
				} else {
					// Mots de passe ne correspondent pas
					return res
						.status(401)
						.json({ message: "L'email ou le mot de passe est incorrect." });
				}
			},
		);
	} catch (error) {
		console.error("Erreur lors de la connexion :", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

// route pour ajouter un user
router.post("/api/add/user", async (req, res) => {
	const hashedPassword = await bcrypt.hash(req.body.password, 10);
	const values = [
		req.body.username,
		req.body.firstName,
		req.body.lastName,
		req.body.email,
		hashedPassword,
		req.body.phoneNumber ? req.body.phoneNumber : null,
	];
	const rek =
		"INSERT INTO user (username, firstName, lastName, email, password, role, phoneNumber, profilePicture, isVerified, passwordResetToken, createdAt, updatedAt, isBanned) VALUES (?, ?, ?, ?, ?, 'client', ?, null, 0, null, NOW(), NOW(), 0)";
	db.query(rek, values, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			res
				.status(200)
				.json({ message: "Utilisateur ajouté avec succès", user: result });
		}
	});
});

// Route pour l'authentification via Google
router.post("/api/auth/google", async (req, res) => {
	const { token } = req.body;

	if (!token) return res.status(400).json({ message: "Token manquant" });

	try {
		// On interroge l'API de Google
		const googleResponse = await fetch(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!googleResponse.ok) {
			return res.status(401).json({ message: "Token Google invalide" });
		}

		const userData = await googleResponse.json();

		const email = userData.email;
		const firstName = userData.given_name;
		const lastName = userData.family_name;
		// const profilePicture = userData.picture || null;

		// On vérifie si cet email existe déjà
		db.query(
			"SELECT * FROM user WHERE email = ?",
			[email],
			async (err, results) => {
				if (err)
					return res
						.status(500)
						.json({ message: "Erreur serveur de base de données" });

				if (results.length > 0) {
					// CONNEXION D'UN UTILISATEUR EXISTANT
					const user = results[0];
					const tokenJWT = jwt.sign(
						buildJwtPayload(user),
						process.env.JWT_SECRET,
						{ expiresIn: "7d" },
					);
					return res
						.status(200)
						.json({ message: "Connexion réussie", jwt: tokenJWT });
				} else {
					// INSCRIPTION D'UN NOUVEL UTILISATEUR
					const randomPassword = crypto.randomBytes(16).toString("hex");
					const hashedPassword = await bcrypt.hash(randomPassword, 10);
					let username = (firstName + Math.floor(Math.random() * 10000))
						.toLowerCase()
						.replace(/\s/g, "");
					username = username.substring(0, 13);

					const insertQuery = `INSERT INTO user (username, firstName, lastName, email, password, role, profilePicture, isVerified, createdAt, updatedAt, isBanned) VALUES (?, ?, ?, ?, ?, 'client', NULL, 1, NOW(), NOW(), 0)`;
					const values = [
						username,
						firstName,
						lastName,
						email,
						hashedPassword /*, profilePicture*/,
					];

					db.query(insertQuery, values, (err, result) => {
						if (err)
							return res
								.status(500)
								.json({ message: "Erreur lors de la création du compte" });

						db.query(
							"SELECT * FROM user WHERE id = ?",
							[result.insertId],
							(fetchErr, createdRows) => {
								if (fetchErr || createdRows.length === 0) {
									return res
										.status(500)
										.json({ message: "Erreur lors de la création du compte" });
								}

								const createdUser = createdRows[0];
								const tokenJWT = jwt.sign(
									buildJwtPayload(createdUser),
									process.env.JWT_SECRET,
									{ expiresIn: "7d" },
								);

								return res
									.status(200)
									.json({ message: "Inscription réussie", jwt: tokenJWT });
							},
						);
					});
				}
			},
		);
	} catch (error) {
		console.error("Erreur serveur Google Auth:", error);
		res.status(500).json({ message: "Erreur interne du serveur" });
	}
});

// Route pour l'authentification via Facebook
// router.post("/api/auth/facebook", async (req, res) => {
//     const { token } = req.body;

//     if (!token) return res.status(400).json({ message: "Token manquant" });

//     try {
//         const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${token}`);

//         if (!fbResponse.ok) {
//             return res.status(401).json({ message: "Token Facebook invalide" });
//         }

//         const userData = await fbResponse.json();

//         if (!userData.email) {
//             return res.status(400).json({ message: "Facebook n'a pas fourni d'adresse e-mail. Celle-ci est requise." });
//         }

//         const email = userData.email;
//         const firstName = userData.first_name || "Utilisateur";
//         const lastName = userData.last_name || "";
//         const profilePicture = userData.picture?.data?.url || null;

//         db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
//             if (err) return res.status(500).json({ message: "Erreur serveur" });

//             if (results.length > 0) {
//                 // CONNEXION
//                 const user = results[0];
//                 const tokenJWT = jwt.sign(
//                     { id_user: user.id, username: user.username, profilePicture: user.profilePicture },
//                     process.env.JWT_SECRET ,
//                     { expiresIn: "7d" }
//                 );
//                 return res.status(200).json({ message: "Connexion réussie", jwt: tokenJWT });
//             } else {
//                 // INSCRIPTION
//                 const randomPassword = crypto.randomBytes(16).toString("hex");
//                 const hashedPassword = await bcrypt.hash(randomPassword, 10);
//                 const username = (firstName + Math.floor(Math.random() * 10000)).toLowerCase().replace(/\s/g, '');

//                 const insertQuery = `INSERT INTO user (username, firstName, lastName, email, password, accountType, profilePicture, isVerified, createdAt, isBanned) VALUES (?, ?, ?, ?, ?, 'free', ?, 1, NOW(), 0)`;
//                 const values = [username, firstName, lastName, email, hashedPassword, profilePicture];

//                 db.query(insertQuery, values, (err, result) => {
//                     if (err) return res.status(500).json({ message: "Erreur lors de l'inscription via Facebook" });

//                     const tokenJWT = jwt.sign(
//                         { id_user: result.insertId, username: username, profilePicture: profilePicture },
//                         process.env.JWT_SECRET ,
//                         { expiresIn: "7d" }
//                     );
//                     return res.status(200).json({ message: "Inscription réussie", jwt: tokenJWT });
//                 });
//             }
//         });
//     } catch (error) {
//         console.error("Erreur serveur Facebook Auth:", error);
//         res.status(500).json({ message: "Erreur interne du serveur" });
//     }
// });

// route pour verifier un email et activer le compte (verification par token)
router.post("/api/verify-email", (req, res) => {
	const token = req.query.token;
	if (token) {
		const rek = "SELECT * FROM user WHERE verificationToken = ?";
		db.query(rek, token, (err, result) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Erreur serveur" });
			} else {
				if (result.length === 0) {
					res.status(404).json({ message: "Token non trouvé" });
				} else {
					const activateAccountRek =
						"UPDATE user SET isVerified = 1, verificationToken = null , updatedAt = CURRENT_TIMESTAMP WHERE verificationToken = ?";
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
	const rek = "SELECT * FROM user WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			if (result.length === 0) {
				res.status(404).json({ message: "Utilisateur non trouvé" });
			} else {
				// Generer un token de verification
				const verificationToken = Math.random()
					.toString(36)
					.substring(2, 8)
					.toUpperCase();

				// Sauvegarder le token de verification dans la base de données
				const saveTokenRek =
					"UPDATE user SET verificationToken = ? , updatedAt = CURRENT_TIMESTAMP WHERE email = ?";
				db.query(
					saveTokenRek,
					[verificationToken, req.body.email],
					(err, result) => {
						if (err) {
							console.log(err);
							res.status(500).json({ message: "Erreur serveur" });
						} else {
							// Envoyer le mail de verification

							// Creer un objet avec des propriétés pour le contenu de l'email
							const emailTemplate = EmailTemplate({
								url: `${process.env.FRONTEND_URL}`,
								text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez idfm_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
								text2: `
								<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #FB5012; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
									<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">
										Veuillez saisir le code de validation ci-dessous :
									</p>
									
									<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #FB5012; display: inline-block; margin-bottom: 15px;">
										<span style="font-size: 28px; font-weight: bold; color: #FB5012; letter-spacing: 6px;">${verificationToken}</span>
									</div>

									<p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
										Ce code est personnel et confidentiel.<br/>Une fois votre compte confirmé, vous pourrez utiliser l'intégralité de nos services.
									</p>
								</div>
							`,
								link: "", // On laisse vide car on ne veut pas générer de bouton cliquable
								logo: logo,
								mail: process.env.MAIL_USER,
							});

							const mailOptions = {
								from: process.env.MAIL_USER,
								to: req.body.email,
								subject: "idfm_hackaton_2026 - Vérification Email",
								html: emailTemplate,
							};

							// Envoyer la réponse d'abord
							res
								.status(200)
								.json({ message: "Mail envoyé avec succès", user: result });

							transporter.sendMail(mailOptions, (err, info) => {
								if (err) {
									console.log("Erreur envoi email vérification:", err);
								} else {
									console.log("Email vérification envoyé:", info);
								}
							});
						}
					},
				);
			}
		}
	});
});

// route pour renvoyer un mail de verification de compte
router.post("/api/resend-verification-email", async (req, res) => {
	const rek = "SELECT * FROM user WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			if (result.length === 0) {
				res.status(404).json({ message: "Utilisateur non trouvé" });
			} else {
				// Generer un token de verification
				const verificationToken = Math.random()
					.toString(36)
					.substring(2, 8)
					.toUpperCase();

				// Enregistrer le token de verification dans la base de données
				const saveTokenRek =
					"UPDATE user SET verificationToken = ? , updatedAt = CURRENT_TIMESTAMP WHERE email = ?";
				db.query(
					saveTokenRek,
					[verificationToken, req.body.email],

					(err, result) => {
						if (err) {
							console.log(err);
							res.status(500).json({ message: "Erreur serveur" });
						} else {
							// Envoyer l'email de vérification

							// Creer un objet avec des propriétés pour le contenu de l'email
							const emailTemplate = EmailTemplate({
								url: `${process.env.FRONTEND_URL}`,
								text1: `<strong style="color: #f8fafc; font-size: 18px;">Bienvenue chez idfm_hackaton_2026 !</strong><br/>Plus qu'une seule étape pour finaliser votre inscription.`,
								text2: `
									<div style="background-color: #1a1e23; padding: 30px 20px; border-radius: 10px; border-left: 4px solid #FB5012; margin-bottom: 20px; border: 1px solid #2a2f3a; text-align: center;">
										<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px;">
											Veuillez saisir le code de validation ci-dessous :
										</p>
										
										<div style="background-color: #0b0d10; padding: 15px 25px; border-radius: 8px; border: 1px dashed #FB5012; display: inline-block; margin-bottom: 15px;">
											<span style="font-size: 28px; font-weight: bold; color: #FB5012; letter-spacing: 6px;">${verificationToken}</span>
										</div>

										<p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
											Ce code est personnel et confidentiel.<br/>Une fois votre compte confirmé, vous pourrez utiliser l'intégralité de nos services.
										</p>
									</div>
								`,
								link: "", // On laisse vide car on ne veut pas générer de bouton cliquable
								logo: logo,
								mail: process.env.MAIL_USER,
							});

							const mailOptions = {
								from: process.env.MAIL_USER,
								to: req.body.email,
								subject: "idfm_hackaton_2026 - Vérification Email",
								html: emailTemplate,
							};

							// Envoyer la réponse d'abord
							res
								.status(200)
								.json({ message: "Mail envoyé avec succès", user: result });

							// Transporter gestion mail
							transporter.sendMail(mailOptions, (err, info) => {
								if (err) {
									console.log("Erreur envoi email re-vérification:", err);
								} else {
									console.log("Email re-vérification envoyé:", info);
								}
							});
						}
					},
				);
			}
		}
	});
});

// route pour demander recuperation de son mot de passe
router.post("/api/forgot-password", async (req, res) => {
	const rek = "SELECT * FROM user WHERE email = ?";
	db.query(rek, req.body.email, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			if (result.length === 0) {
				res.status(404).json({ message: "Ce compte utilisateur n'existe pas" });
			} else {
				// Generer un token de reinitialisation de mot de passe
				const passwordResetToken = Math.random().toString(36).substring(2, 17);

				const uid = result[0].id;

				// Enregistrer le token de reinitialisation de mot de passe dans la base de données
				const saveTokenRek =
					"UPDATE user SET passwordResetToken = ? WHERE email = ?";
				db.query(
					saveTokenRek,
					[passwordResetToken, req.body.email],
					(err, result) => {
						if (err) {
							console.log(err);
							res.status(500).json({ message: "Erreur serveur" });
						} else {
							// Envoyer l'email de réinitialisation de mot de passe
							const emailTemplate = EmailTemplate({
								url: `${process.env.FRONTEND_URL}`,
								text1: `<strong style="color: #f8fafc; font-size: 18px;">Réinitialisation de mot de passe</strong><br/>Vous avez demandé à modifier votre mot de passe sur idfm_hackaton_2026.`,
								text2: `
									<div style="background-color: #1a1e23; padding: 20px; border-radius: 10px; border-left: 4px solid #FB5012; margin-bottom: 20px; border: 1px solid #2a2f3a;">
										<p style="margin: 0 0 15px 0; color: #f8fafc; font-size: 15px; line-height: 1.6;">
											Pour choisir un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous. Ce lien expirera par mesure de sécurité.
										</p>
										
										<div style="background-color: #0b0d10; padding: 15px; border-radius: 8px; border: 1px solid #2a2f3a;">
											<p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
												<strong>Note de sécurité :</strong> Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.
											</p>
										</div>
									</div>
								`,
								// On simplifie le lien : ton emailTemplate.js s'occupera de lui mettre le fond orange et le style bouton
								link: `<a href='${process.env.FRONTEND_URL}/signin/modifypw?token=${passwordResetToken}&uid=${uid}' target='_blank'>Réinitialiser mon mot de passe</a>`,
								logo: logo,
								mail: process.env.MAIL_USER,
							});

							const mailOptions = {
								from: process.env.MAIL_USER,
								to: req.body.email,
								subject: "idfm_hackaton_2026 - Réinitialisation de mot de passe",
								html: emailTemplate,
							};

							// Envoyer la réponse d'abord
							res
								.status(200)
								.json({ message: "Mail envoyé avec succès", user: result });

							// Transporter gestion mail
							transporter.sendMail(mailOptions, (err, info) => {
								if (err) {
									console.log("Erreur envoi email reset password:", err);
								} else {
									console.log("Email reset password envoyé:", info);
								}
							});
						}
					},
				);
			}
		}
	});
});

// route pour juste recuperer le token de reinitialisation de mot de passe
router.get("/api/reset-password", (req, res) => {
	const token = req.query.token;
	const uid = req.query.uid;
	if (token) {
		const rek = "SELECT * FROM user WHERE passwordResetToken = ? AND id = ?";
		db.query(rek, [token, uid], (err, result) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Erreur serveur" });
			} else {
				if (result.length === 0) {
					res.status(404).json({ message: "Token non trouvé" });
				} else {
					res.status(200).json({
						message: "Token trouvé",
						token: result[0].passwordResetToken,
					});
				}
			}
		});
	} else {
		res.status(400).json({ message: "Token non trouvé" });
	}
});

// route pour reinitialiser son mot de passe
router.post("/api/reset-password", async (req, res) => {
	const token = req.query.token;
	if (token) {
		const rek = "SELECT * FROM user WHERE passwordResetToken = ?";
		db.query(rek, token, async (err, result) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: "Erreur serveur" });
			} else {
				if (result.length === 0) {
					res.status(404).json({ message: "Token non trouvé" });
				} else {
					const hashedPassword = await bcrypt.hash(req.body.password, 10);
					const resetPasswordRek =
						"UPDATE user SET password = ?, passwordResetToken = null WHERE passwordResetToken = ?";
					db.query(resetPasswordRek, [hashedPassword, token], (err, result) => {
						if (err) {
							console.log(err);
							res.status(500).json({ message: "Erreur serveur" });
						} else {
							res.status(200).json({ message: "Mot de passe réinitialisé" });
						}
					});
				}
			}
		});
	} else {
		res.status(400).json({ message: "Token non trouvé" });
	}
});

module.exports = router;
