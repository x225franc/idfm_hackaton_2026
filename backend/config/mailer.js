const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { resolve } = require("path");

dotenv.config({ path: resolve(__dirname, "../../.env") });

const isEmailEnabled = process.env.ENABLE_EMAIL === "true";

let transporter;

if (isEmailEnabled) {
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
	transporter = {
		sendMail: (mailOptions, callback) => {
			
			if (callback) {
				console.log("Service d'email DÉSACTIVÉ (mode développement)");
			}
		}
	};
}

module.exports = transporter;