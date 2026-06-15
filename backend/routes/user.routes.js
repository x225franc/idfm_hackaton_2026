const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const db = require("../config/db");
const transporter = require("../config/mailer");
const EmailTemplate = require("../components/emailTemplate");

// Configuration constantes
const backendUrl = process.env.BACKEND_URL;
const logo = `${process.env.BACKEND_URL}/components/idfm_hackaton_2026/logo.png`;

// recuperer tout les users
router.get("/api/get/user", (req, res) => {
	const rek = "SELECT * FROM user";
	db.query(rek, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.json(result);
		}
	});
});

// recuperer tout les users (admin) avec filtres, recherche et pagination
router.get("/api/get/user/admin", async (req, res) => {
	try {
		// Récupération des paramètres de l'URL
		const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
		const offset = Math.max(0, Number(req.query.offset) || 0);

		const q = req.query.q ? String(req.query.q).trim() : "";
		const role = req.query.role ? String(req.query.role).trim() : "";
		const status = req.query.status ? String(req.query.status).trim() : "";

		// Construction dynamique de la requête SQL
		const where = ["id != 1", "id != 2"];
		const values = [];

		// Filtre par rôle
		if (role === "admin" || role === "client") {
			where.push("role = ?");
			values.push(role);
		}

		// Filtre par statut (actif / banni)
		if (status === "active") {
			where.push("isBanned = 0");
		} else if (status === "banned") {
			where.push("isBanned = 1");
		}

		// Filtre par texte (Recherche)
		if (q) {
			where.push(
				"(username LIKE ? OR email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)",
			);
			const searchPattern = `%${q}%`;
			values.push(searchPattern, searchPattern, searchPattern, searchPattern);
		}

		const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

		// Les deux requêtes : une pour les données, une pour le total (pour la pagination)
		const dataQuery = `SELECT * FROM user ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
		const dataValues = [...values, limit, offset];

		const countQuery = `SELECT COUNT(*) AS total FROM user ${whereSql}`;

		// Promesses pour exécuter les deux requêtes proprement
		const fetchUsers = () =>
			new Promise((resolve, reject) => {
				db.query(dataQuery, dataValues, (err, result) => {
					if (err) reject(err);
					else resolve(result);
				});
			});

		const fetchCount = () =>
			new Promise((resolve, reject) => {
				db.query(countQuery, values, (err, result) => {
					if (err) reject(err);
					else resolve(result);
				});
			});

		// Exécution simultanée
		const [items, countResult] = await Promise.all([
			fetchUsers(),
			fetchCount(),
		]);

		// Format de réponse adapté au nouveau frontend
		res.json({
			items: items,
			total: countResult[0].total,
			limit: limit,
			offset: offset,
		});
	} catch (error) {
		console.error("Erreur récupération utilisateurs admin:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

// recuperer un user via son email
router.get("/api/get/user/email/:email", (req, res) => {
	const email = req.params.email;
	const rek = "SELECT * FROM user WHERE email = ?";
	db.query(rek, email, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.json(result);
		}
	});
});

// route pour recuperer un user
router.get("/api/get/user/:id", (req, res) => {
	const id = req.params.id;
	const rek = "SELECT * FROM user WHERE id = ?";

	db.query(rek, id, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else if (result.length === 0) {
			res.status(404).json({ message: "Utilisateur non trouvé" });
		} else {
			const user = result[0];
			const formattedUser = {
				id_user: user.id,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				phoneNumber: user.phoneNumber,
				address: user.address,
				postalCode: user.postalCode,
				city: user.city,
				profilePicture:
					user.profilePicture !== null
						? backendUrl + user.profilePicture
						: null,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				isBanned: user.isBanned,
			};
			res.json(formattedUser);
		}
	});
});

// route pour supprimer un user
// router.delete("/api/delete/user/:id", (req, res) => {
// 	const id = req.params.id;

// 	// First, fetch the user info
// 	const userQuery = "SELECT * FROM user WHERE id = ?";
// 	db.query(userQuery, id, (err, result) => {
// 		if (err) {
// 			console.log(err);
// 			return res.status(500).json({ message: "Erreur serveur" });
// 		}

// 		const user = result[0];

// 		// if there's a profile picture, delete it
// 		if (user.profilePicture) {
// 			const imagePath = "uploads" + user.profilePicture;
// 			if (
// 				fs.existsSync
// 					? fs.existsSync(imagePath)
// 					: path.existsSync(imagePath)
// 			) {
// 				fs.unlink(imagePath, (err) => {
// 					if (err) console.error("Error deleting image:", err);
// 				});
// 			}
// 		}

// 		// Delete the user
// 		const sql = "DELETE FROM user WHERE id = ?";
// 		db.query(sql, id, (err, result) => {
// 			if (err) {
// 				console.log(err);
// 				return res.status(500).json({ message: "Erreur serveur" });
// 			}

// 			// Send response first
// 			res.json({ message: "Utilisateur supprimé" });

// 			// Send email notification (fire-and-forget)
// 			const emailTemplate = EmailTemplate({
//				url : `${process.env.FRONTEND_URL}`,
// 				text1: `Votre compte a été supprimé de idfm_hackaton_2026.`,
// 				text2: `Si vous pensez que c'est une erreur, contactez-nous.`,
// 				logo: logo,
// 				mail: process.env.MAIL_USER,
// 			});

// 			const mailOptions = {
// 				from: process.env.MAIL_USER,
// 				to: user.email,
// 				subject: "idfm_hackaton_2026 - Compte supprimé",
// 				html: emailTemplate,
// 			};

// 			transporter.sendMail(mailOptions, (err, info) => {
// 				if (err) {
// 					console.log("Erreur envoi email suppression user:", err);
// 				} else {
// 					console.log("Email suppression user envoyé:", info);
// 				}
// 			});
// 		});
// 	});
// });

// route pour verifier si le mot de passe est correct
// router.post("/api/check-password", async (req, res) => {
// 	const rek = "SELECT * FROM user WHERE id = ?";
// 	db.query(rek, req.body.id, async (err, result) => {
// 		if (err) {
// 			console.log(err);
// 			res.status(500).json({ message: "Erreur serveur" });
// 		} else {
// 			if (result.length === 0) {
// 				res.status(404).json({ message: "Utilisateur non trouvé" });
// 			} else {
// 				const user = result[0];

// 				// Vérification de l'ancien mot de passe
// 				const passwordMatch = await bcrypt.compare(
// 					req.body.password, // The password entered by the user
// 					user.password // The hashed password stored in the database
// 				);
// 				if (passwordMatch) {
// 					res.status(200).json({ message: "Le mot de passe correspond" });
// 				} else {
// 					res
// 						.status(401)
// 						.json({ message: "Le mot de passe ne correspond pas" });
// 				}

// 				res.status(200).json({
// 					message:
// 						"Vérification de l'ancien mot de passe désactivée pour la mise à jour profil",
// 				});
// 			}
// 		}
// 	});
// });

// route pour modifier un user
router.put("/api/update/user/:id", async (req, res) => {
	const id = req.params.id;

	const fetchUserQuery = "SELECT * FROM user WHERE id = ?";
	db.query(fetchUserQuery, [id], async (err, rows) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (rows.length === 0)
			return res.status(404).json({ message: "User not found" });

		const user = rows[0];

		// Check if newPassword is provided and hash it
		let hashedPassword;
		if (req.body.password && req.body.password.trim() !== "") {
			hashedPassword = await bcrypt.hash(req.body.password, 10);
		}

		let images = "";
		if (req.files && req.files.length > 0) {
			// Check if old image exists and delete it
			const oldImagePath = "uploads" + user.profilePicture;
			if (user.profilePicture && fs.existsSync(oldImagePath)) {
				fs.unlink(oldImagePath, () => {});
			}

			const file = req.files[0];
			const imagePath =
				"uploads/images/user/" +
				"user-" +
				path.parse(file.filename).name +
				".png";

			if (!fs.existsSync("uploads/images/user"))
				fs.mkdirSync("uploads/images/user", { recursive: true });

			await sharp(file.path)
				.resize({ width: 300, height: 300, fit: "cover" }) // Mieux pour les avatars
				.png({ quality: 80 })
				.toFile(imagePath);

			images = imagePath.replace("uploads", "");
			fs.unlink(file.path, () => {});
		}

		const values = [];
		let rek = "UPDATE user SET updatedAt = NOW()";

		if (hashedPassword) {
			rek += ", password = ?";
			values.push(hashedPassword);
		}
		if (images !== "") {
			rek += ", profilePicture = ?";
			values.push(images);
		}

		// NOUVEAUX CHAMPS
		if (req.body.address !== undefined) {
			rek += ", address = ?";
			values.push(req.body.address || null);
		}
		if (req.body.postalCode !== undefined) {
			rek += ", postalCode = ?";
			values.push(req.body.postalCode || null);
		}
		if (req.body.city !== undefined) {
			rek += ", city = ?";
			values.push(req.body.city || null);
		}

		if (req.body.phoneNumber) {
			const sqlCheck = "SELECT * FROM user WHERE phoneNumber = ? AND id != ?";
			db.query(sqlCheck, [req.body.phoneNumber, id], (err, rows) => {
				if (err) return res.status(500).json({ message: "Erreur serveur" });
				if (rows.length > 0)
					return res
						.status(400)
						.json({ message: "Numéro de téléphone déjà pris" });

				rek += ", phoneNumber = ?";
				values.push(req.body.phoneNumber);
				updateUserInfo();
			});
		} else {
			updateUserInfo();
		}

		function updateUserInfo() {
			rek += " WHERE id = ?";
			values.push(id);
			db.query(rek, values, (err, result) => {
				if (err) return res.status(500).json({ message: "Erreur serveur" });

				db.query(fetchUserQuery, [id], (err, rows) => {
					if (err)
						return res.status(500).json({ message: "Erreur récupération" });

					const updatedUser = rows[0];
					const newToken = jwt.sign(
						{
							id_user: updatedUser.id,
							username: updatedUser.username,
							firstName: updatedUser.firstName,
							lastName: updatedUser.lastName,
							email: updatedUser.email,
							role: updatedUser.role,
							phoneNumber: updatedUser.phoneNumber,
							address: updatedUser.address,
							postalCode: updatedUser.postalCode,
							city: updatedUser.city,
							profilePicture:
								updatedUser.profilePicture !== null
									? backendUrl + updatedUser.profilePicture
									: null,
							isVerified: updatedUser.isVerified,
						},
						process.env.JWT_SECRET,
						{ expiresIn: "24h" },
					);

					res.status(200).json({
						message: "Profil mis à jour avec succès",
						jwt: newToken,
					});
				});
			});
		}
	});
});

// route permettant de bannir un utilisateur  (admin)
router.put("/api/ban/user/:id", (req, res) => {
	const id = req.params.id;
	const sql = "UPDATE user SET isBanned = 1 WHERE id = ?";
	db.query(sql, id, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			res.status(200).json({ message: "Utilisateur banni !" });

			// Envoi d'un mail à l'utilisateur banni (fire-and-forget)
			const emailQuery = "SELECT * FROM user WHERE id = ?";
			db.query(emailQuery, id, (err, ress) => {
				if (err) {
					console.log("Erreur récupération user pour email ban:", err);
					return;
				}

				const emailTemplate = EmailTemplate({
					url: `${process.env.FRONTEND_URL}`,
					text1: `<strong style="color: #ef4444; font-size: 18px;">Suspension de compte</strong><br/>Nous vous informons que votre compte a été suspendu de la plateforme idfm_hackaton_2026.`,
					text2: `
						<div style="background-color: #1a1e23; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444; margin-bottom: 20px; border: 1px solid #2a2f3a;">
							<h3 style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px; border-bottom: 1px solid #2a2f3a; padding-bottom: 10px;">
								Information importante
							</h3>
							<p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
								Suite à une violation de nos conditions d'utilisation ou à une activité non autorisée, l'accès à votre compte a été révoqué avec effet immédiat.
							</p>
							
							<div style="background-color: #0b0d10; padding: 15px; border-radius: 8px; border: 1px solid #2a2f3a;">
								<p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
									<strong>Droit de recours :</strong> Si vous pensez qu'il s'agit d'une erreur ou d'un malentendu, notre équipe se tient à votre disposition pour réexaminer votre dossier.
								</p>
							</div>
						</div>
					`,
					link: `<a href="mailto:${process.env.MAIL_USER}">Contacter le support</a>`,
					logo: logo,
					mail: process.env.MAIL_USER,
				});

				const mailOptions = {
					from: process.env.MAIL_USER,
					to: ress[0].email,
					subject: "idfm_hackaton_2026 - Compte suspendu",
					html: emailTemplate,
				};

				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err);
						console.log("Email callback - response already sent");
					} else {
						console.log(info);
					}
				});
			});
		}
	});
});

// route permettant de rétablir un compte utilisateur  (admin)
router.put("/api/unban/user/:id", (req, res) => {
	const id = req.params.id;
	const sql = "UPDATE user SET isBanned = 0 WHERE id = ?";
	db.query(sql, id, (err, result) => {
		if (err) {
			console.log(err);
			res.status(500).json({ message: "Erreur serveur" });
		} else {
			res.json({ message: "Utilisateur rétabli !" });

			// Envoi d'un mail à l'utilisateur rétabli (fire-and-forget)
			const emailQuery = "SELECT * FROM user WHERE id = ?";
			db.query(emailQuery, id, (err, ress) => {
				if (err) {
					console.log("Erreur récupération user pour email unban:", err);
					return;
				}

				const emailTemplate = EmailTemplate({
					url: `${process.env.FRONTEND_URL}`,
					text1: `<strong style="color: #10b981; font-size: 18px;">Excellente nouvelle !</strong><br/>Votre compte idfm_hackaton_2026 a été entièrement rétabli.`,
					text2: `
						<div style="background-color: #1a1e23; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 20px; border: 1px solid #2a2f3a;">
							<h3 style="margin: 0 0 15px 0; color: #f8fafc; font-size: 16px; border-bottom: 1px solid #2a2f3a; padding-bottom: 10px;">
								Statut du compte : Actif
							</h3>
							<p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
								Après examen de votre dossier, nous avons le plaisir de vous informer que toutes les restrictions ont été levées. Vous pouvez dès à présent vous connecter et utiliser l'intégralité de nos services en toute sécurité.
							</p>
							
							<div style="background-color: #0b0d10; padding: 15px; border-radius: 8px; border: 1px solid #2a2f3a;">
								<p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
									Nous vous remercions sincèrement pour votre patience et votre coopération durant nos vérifications. Bon retour parmi nous !
								</p>
							</div>
						</div>
					`,
					link: `<a href="${process.env.FRONTEND_URL}/signin">Me connecter</a>`,
					logo: logo,
					mail: process.env.MAIL_USER,
				});

				const mailOptions = {
					from: process.env.MAIL_USER,
					to: ress[0].email,
					subject: "idfm_hackaton_2026 - Compte rétabli",
					html: emailTemplate,
				};

				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err);
						console.log("Email callback - response already sent");
					} else {
						console.log(info);
					}
				});
			});
		}
	});
});

// Route pour changer le rôle d'un utilisateur (admin)
router.put("/api/user/:id/role", (req, res) => {
	const id = req.params.id;
	const { role } = req.body;
	if (!role || !["admin", "client"].includes(role)) {
		return res.status(400).json({ message: "Rôle invalide" });
	}
	// Vérification admin (optionnel, à adapter selon votre logique d'authentification)
	// ...
	const sql = "UPDATE user SET role = ?, updatedAt = NOW() WHERE id = ?";
	db.query(sql, [role, id], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: "Erreur serveur" });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}
		res.status(200).json({ message: "Rôle modifié avec succès" });
	});
});

module.exports = router;
