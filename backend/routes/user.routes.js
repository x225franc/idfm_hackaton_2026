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

const backendUrl = process.env.BACKEND_URL;
const logo = `${process.env.BACKEND_URL}/components/logo.png`;

// recuperer tout les comptes (admin basique)
router.get("/api/get/user", (req, res) => {
	const rek = "SELECT * FROM compte_connect";
	db.query(rek, (err, result) => {
		if (err) console.log(err);
		else res.json(result);
	});
});

// recuperer tous les users (admin) avec filtres
router.get("/api/get/user/admin", async (req, res) => {
	try {
		const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
		const offset = Math.max(0, Number(req.query.offset) || 0);

		const q = req.query.q ? String(req.query.q).trim() : "";
		const role = req.query.role ? String(req.query.role).trim() : "";
		const status = req.query.status ? String(req.query.status).trim() : "";

		const where = ["id != 1", "id != 2"];
		const values = [];

		if (role === "admin" || role === "user") {
			where.push("role = ?");
			values.push(role);
		}

		if (status === "active") where.push("isBanned = 0");
		else if (status === "banned") where.push("isBanned = 1");

		if (q) {
			where.push("(email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)");
			const searchPattern = `%${q}%`;
			values.push(searchPattern, searchPattern, searchPattern);
		}

		const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
		const dataQuery = `SELECT * FROM compte_connect ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
		const dataValues = [...values, limit, offset];
		const countQuery = `SELECT COUNT(*) AS total FROM compte_connect ${whereSql}`;

		const fetchUsers = () => new Promise((resolve, reject) => {
			db.query(dataQuery, dataValues, (err, result) => err ? reject(err) : resolve(result));
		});

		const fetchCount = () => new Promise((resolve, reject) => {
			db.query(countQuery, values, (err, result) => err ? reject(err) : resolve(result));
		});

		const [items, countResult] = await Promise.all([fetchUsers(), fetchCount()]);

		res.json({ items: items, total: countResult[0].total, limit: limit, offset: offset });
	} catch (error) {
		console.error("Erreur récupération utilisateurs admin:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

// route pour recuperer un user et son profil associé
router.get("/api/get/user/:id", (req, res) => {
	const id = req.params.id;
    // On join les deux tables pour tout renvoyer au front en une fois
	const rek = "SELECT c.*, p.id as profil_id, p.type_profil, p.phoneNumber, p.profilePicture, p.address, p.postalCode, p.city, p.profession, p.date_naissance FROM compte_connect c LEFT JOIN profil p ON c.id = p.compte_id WHERE c.id = ?";

	db.query(rek, id, (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (result.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

		const user = result[0];
		const formattedUser = {
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
            // Info de profil :
            profil_id: user.profil_id || null,
            phoneNumber: user.phoneNumber || null,
            address: user.address || null,
            postalCode: user.postalCode || null,
            city: user.city || null,
            profession: user.profession || null,
            date_naissance: user.date_naissance || null,
            profilePicture: user.profilePicture ? backendUrl + user.profilePicture : null
		};
		res.json(formattedUser);
	});
});

// route pour modifier un user (Séparé en modification compte_connect et profil)
router.put("/api/update/user/:id", async (req, res) => {
	const id = req.params.id;

	const fetchUserQuery = "SELECT c.*, p.profilePicture FROM compte_connect c LEFT JOIN profil p ON c.id = p.compte_id WHERE c.id = ?";
	db.query(fetchUserQuery, [id], async (err, rows) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (rows.length === 0) return res.status(404).json({ message: "User not found" });

		const user = rows[0];

        // 1. Mise à jour de la sécurité (mot de passe dans compte_connect)
		if (req.body.password && req.body.password.trim() !== "") {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
            db.query("UPDATE compte_connect SET password = ?, updatedAt = NOW() WHERE id = ?", [hashedPassword, id]);
		} else {
            db.query("UPDATE compte_connect SET updatedAt = NOW() WHERE id = ?", [id]);
        }

        // 2. Gestion de l'image (dans profil)
		let images = null;
		if (req.files && req.files.length > 0) {
			const oldImagePath = "uploads" + user.profilePicture;
			if (user.profilePicture && fs.existsSync(oldImagePath)) fs.unlink(oldImagePath, () => {});

			const file = req.files[0];
			const imagePath = "uploads/images/user/" + "user-" + path.parse(file.filename).name + ".png";

			if (!fs.existsSync("uploads/images/user")) fs.mkdirSync("uploads/images/user", { recursive: true });

			await sharp(file.path).resize({ width: 300, height: 300, fit: "cover" }).png({ quality: 80 }).toFile(imagePath);

			images = imagePath.replace("uploads", "");
			fs.unlink(file.path, () => {});
		}

        // 3. Mise à jour des infos personnelles (dans profil)
        // Vérifie d'abord si le profil existe
        db.query("SELECT id FROM profil WHERE compte_id = ?", [id], (err, profilRows) => {
            if(err) return res.status(500).json({ message: "Erreur profil" });

            if(profilRows.length > 0) {
                // Le profil existe, on fait un UPDATE
                let updateProfilRek = "UPDATE profil SET ";
                const profilValues = [];
                const updates = [];

                if (images !== null) { updates.push("profilePicture = ?"); profilValues.push(images); }
                if (req.body.address !== undefined) { updates.push("address = ?"); profilValues.push(req.body.address || null); }
                if (req.body.postalCode !== undefined) { updates.push("postalCode = ?"); profilValues.push(req.body.postalCode || null); }
                if (req.body.city !== undefined) { updates.push("city = ?"); profilValues.push(req.body.city || null); }
                if (req.body.phoneNumber !== undefined) { updates.push("phoneNumber = ?"); profilValues.push(req.body.phoneNumber || null); }

                if (updates.length > 0) {
                    updateProfilRek += updates.join(", ") + " WHERE compte_id = ?";
                    profilValues.push(id);
                    db.query(updateProfilRek, profilValues, finishUpdate);
                } else {
                    finishUpdate();
                }
            } else {
                finishUpdate();
            }
        });

		function finishUpdate() {
			res.status(200).json({ message: "Mise à jour traitée avec succès." });
		}
	});
});

// route permettant de bannir un utilisateur (admin)
router.put("/api/ban/user/:id", (req, res) => {
	const id = req.params.id;
	const sql = "UPDATE compte_connect SET isBanned = 1 WHERE id = ?";
	db.query(sql, id, (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		res.status(200).json({ message: "Utilisateur banni !" });

		const emailQuery = "SELECT * FROM compte_connect WHERE id = ?";
		db.query(emailQuery, id, (err, ress) => {
			if (err) return;

			const emailTemplate = EmailTemplate({
				url: `${process.env.FRONTEND_URL}`,
                text1: `<strong style="color: #ef4444; font-size: 18px;">Suspension de compte</strong>`,
                text2: `L'accès à votre compte a été révoqué.`,
                link: `<a href="mailto:${process.env.MAIL_USER}">Contacter le support</a>`,
                logo: logo,
                mail: process.env.MAIL_USER,
            });

			transporter.sendMail({
				from: process.env.MAIL_USER,
				to: ress[0].email,
				subject: "comutitres_hackaton_2026 - Compte suspendu",
				html: emailTemplate,
			}, () => {});
		});
	});
});

// route permettant de rétablir un compte utilisateur (admin)
router.put("/api/unban/user/:id", (req, res) => {
	const id = req.params.id;
	const sql = "UPDATE compte_connect SET isBanned = 0 WHERE id = ?";
	db.query(sql, id, (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		res.json({ message: "Utilisateur rétabli !" });

		const emailQuery = "SELECT * FROM compte_connect WHERE id = ?";
		db.query(emailQuery, id, (err, ress) => {
			if (err) return;
            const emailTemplate = EmailTemplate({
				url: `${process.env.FRONTEND_URL}`,
                text1: `<strong style="color: #6485F6; font-size: 18px;">Excellente nouvelle !</strong>`,
                text2: `Votre compte comutitres_hackaton_2026 a été entièrement rétabli.`,
                link: `<a href="${process.env.FRONTEND_URL}/signin">Me connecter</a>`,
                logo: logo,
                mail: process.env.MAIL_USER,
            });
			transporter.sendMail({
				from: process.env.MAIL_USER,
				to: ress[0].email,
				subject: "comutitres_hackaton_2026 - Compte rétabli",
				html: emailTemplate,
			}, () => {});
		});
	});
});

// Route pour changer le rôle d'un utilisateur (admin)
router.put("/api/user/:id/role", (req, res) => {
	const id = req.params.id;
	const { role } = req.body;
	if (!role || !["admin", "user"].includes(role)) return res.status(400).json({ message: "Rôle invalide" });

	const sql = "UPDATE compte_connect SET role = ?, updatedAt = NOW() WHERE id = ?";
	db.query(sql, [role, id], (err, result) => {
		if (err) return res.status(500).json({ message: "Erreur serveur" });
		if (result.affectedRows === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
		res.status(200).json({ message: "Rôle modifié avec succès" });
	});
});

module.exports = router;