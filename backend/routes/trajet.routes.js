const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajet.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/api/trajets/me', verifyToken, trajetController.getTrajets);

module.exports = router;
