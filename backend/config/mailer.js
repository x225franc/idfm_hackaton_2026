const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { resolve } = require("path");

dotenv.config({ path: resolve(__dirname, "../../.env") });

// Vérifier si l'envoi d'emails est activé
const isEmailEnabled = process.env.ENABLE_EMAIL === "true";

let transporter;

if (isEmailEnabled) {
	// Configurer le transporteur de mail avec les informations d'authentification
	transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false, 
		requireTLS: true, 
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		},
	});
	console.log("Service d'email activé");
} else {
	// Créer un faux transporteur qui log dans la console au lieu d'envoyer des emails
	transporter = {
		sendMail: (mailOptions, callback) => {
			// console.log("[EMAIL DÉSACTIVÉ] Email qui aurait été envoyé:");
			// console.log("   De:", mailOptions.from);
			// console.log("   À:", mailOptions.to);
			// console.log("   Sujet:", mailOptions.subject);
			
			// Simuler un succès
			if (callback) {
				// callback(null, { response: "Email simulation - pas envoyé" });
				console.log("Service d'email DÉSACTIVÉ (mode développement)");
			}
		}
	};
}

module.exports = transporter;