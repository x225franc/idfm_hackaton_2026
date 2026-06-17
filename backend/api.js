// importation de express , mysql et cors
const express = require("express");
const cors = require("cors");
const http = require("http");

// importation de middleware pour les images
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// importation de dotenv
const dotenv = require("dotenv");
const { resolve } = require("path");

// importation de la connexion à la base de données
const db = require("./config/db");

// métriques Prometheus
const { metricsMiddleware, metricsHandler } = require("./middleware/metrics");

// configuration de dotenv
dotenv.config({ path: resolve(__dirname, "../.env") });

// creation de l'instance express (serveur)
const app = express();
app.use(express.json());


// Vérification de la présence de JWT_SECRET dans le fichier .env
if (!process.env.JWT_SECRET) {
    console.error('Erreur : JWT_SECRET n\'est pas défini dans le fichier .env');
    process.exit(1);
}

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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

// image upload via multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/images");
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + path.extname(file.originalname));
	},
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Type de fichier non valide. Seules les images sont autorisées.'), false);
        }
        cb(null, true);
    },
});
app.use(upload.array("images"));

// Handler d'erreur pour les uploads d'images
app.use((err, req, res, next) => {
    if (err && err.message) {
        if (err instanceof Error || err.name === 'MulterError') {
            return res.status(400).json({ error: err.message });
        }
    }
    next(err);
});

// route pour servir les images
app.use("/images", express.static(path.join(__dirname, "uploads/images")));
app.use("/components/idfm_hackaton_2026",express.static(path.join(__dirname, "components/idfm_hackaton_2026")),);

/////////////////////////////////////////////////////////////////////////////////

// Importation des routes

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const profilRoutes = require("./routes/profil.routes");
const forfaitRoutes = require("./routes/forfait.routes");
const documentRoutes = require("./routes/document.routes");
const paiementRoutes = require("./routes/paiement.routes");


// Utilisation des routes
app.use(authRoutes);
app.use(userRoutes);
app.use(profilRoutes);
app.use(forfaitRoutes);
app.use(documentRoutes);
app.use(paiementRoutes);

/////////////////////////////////////////////////////////////////////////////////
const httpServer = http.createServer(app);

// offline
if (process.env.ENV === "development") {
	db.connect((err) => {
		if (err) {
			console.error("Erreur de connexion a la bdd : " + err.stack);
			return;
		}
		console.log("Connecté a la bdd.");
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
		httpServer.listen((err) => {
			if (err) {
				console.error("Erreur de demarrage du serveur : " + err.stack);
				return;
			}
		});
	});
}
