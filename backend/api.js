// dotenv + GlitchTip doivent être chargés avant express : Sentry instrumente le module
// express lui-même au moment où il est require() pour la première fois, donc Sentry.init()
// (déclenché par ce require) doit obligatoirement précéder `require('express')`.
const dotenv = require('dotenv');
const { resolve } = require('path');
dotenv.config({ path: resolve(__dirname, '../.env') });
const Sentry = require('./config/sentry');

// importation de express , mysql et cors
const express = require("express");
const cors = require("cors");
const http = require("http");
const swaggerUi = require("swagger-ui-express");

// importation de middleware pour les images
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// importation de la connexion à la base de données
const db = require("./config/db");

// métriques Prometheus
const { metricsMiddleware, metricsHandler } = require("./middleware/metrics");

// creation de l'instance express (serveur)
const app = express();
app.use(express.json());

// Vérification de la présence de JWT_SECRET dans le fichier .env
if (!process.env.JWT_SECRET) {
	console.error("Erreur : JWT_SECRET n'est pas défini dans le fichier .env");
	process.exit(1);
}

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(metricsMiddleware);

// Endpoint Prometheus — accessible par le conteneur prometheus sur /metrics
app.get("/metrics", metricsHandler);

/////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
	res.redirect(process.env.FRONTEND_URL);
	// res.send("Hello world!");
});

/////////////////////////////////////////////////////////////////////////////////

// Création automatique du dossier d'upload s'il n'existe pas
const uploadDir = path.join(__dirname, "uploads", "images");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// image upload via multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + path.extname(file.originalname));
	},
});
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/jpg",
			"image/pjpeg",
			"application/pdf",
			"application/x-pdf",
		];
		const ext = path.extname(file.originalname || "").toLowerCase();
		const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
		if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
			return cb(
				new Error(
					"Type de fichier non valide. Seuls les formats JPG, PNG et PDF sont autorisés.",
				),
				false,
			);
		}
		cb(null, true);
	},
});
app.use(upload.array("images"));

// Handler d'erreur pour les uploads d'images
app.use((err, req, res, next) => {
	if (err && err.message) {
		if (err instanceof Error || err.name === "MulterError") {
			return res.status(400).json({ error: err.message });
		}
	}
	next(err);
});

app.use(
	"/uploads/images",
	express.static(uploadDir),
);
app.use(
	"/documents",
	express.static(uploadDir),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
	"/components",
	express.static(path.join(__dirname, "components/")),
);

/////////////////////////////////////////////////////////////////////////////////

// Swagger UI
const swaggerSpec = require("./config/swagger");
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customSiteTitle: "Comutitres API",
		swaggerOptions: { defaultModelsExpandDepth: -1 },
	}),
);

// Importation des routes

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const profilRoutes = require("./routes/profil.routes");
const forfaitRoutes = require("./routes/forfait.routes");
const documentRoutes = require("./routes/document.routes");
const paiementRoutes = require("./routes/paiement.routes");
const chatRoutes = require("./routes/chat.routes");
const notificationRoutes = require("./routes/notification.routes");
const familyRoutes = require("./routes/family.routes");
const trajetRoutes = require("./routes/trajet.routes");

// Utilisation des routes
app.use(authRoutes);
app.use(userRoutes);
app.use(profilRoutes);
app.use(forfaitRoutes);
app.use(documentRoutes);
app.use(paiementRoutes);
app.use(chatRoutes);
app.use(notificationRoutes);
app.use(familyRoutes);
app.use(trajetRoutes);

if (process.env.ENV === 'development') {
  app.get('/api/debug-sentry', () => {
    throw new Error('Erreur de test GlitchTip (backend)');
  });
}

Sentry.setupExpressErrorHandler(app);

/////////////////////////////////////////////////////////////////////////////////
const httpServer = http.createServer(app);
const {
	startNotificationScheduler,
} = require("./services/notification.scheduler");

// offline
if (process.env.ENV === "development") {
	db.connect((err) => {
		if (err) {
			console.error("Erreur de connexion a la bdd : " + err.stack);
			return;
		}
		console.log("Connecté a la bdd.");
		startNotificationScheduler();
		httpServer.listen(process.env.BACKEND_PORT, () => {
			console.log(
				`Le serveur est en cours d'execution sur le port ${process.env.BACKEND_PORT}.`,
			);
		});
	});
} else if (process.env.ENV === "production") {
	// online
	db.connect((err) => {
		if (err) {
			console.error("Erreur de connexion a la bdd : " + err.stack);
			return;
		}
		console.log("Connecté a la bdd.");

		startNotificationScheduler();
		httpServer.listen(process.env.BACKEND_PORT, () => {
			console.log(
				`Le serveur est en cours d'execution sur le port ${process.env.BACKEND_PORT}.`,
			);
		});
	});
}