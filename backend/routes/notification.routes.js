const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notifController = require('../controllers/notification.controller');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Rappels de renouvellement et changements de tranche d'âge
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer toutes les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       401:
 *         description: Non authentifié
 */
router.get('/api/notifications', auth, notifController.getAll);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total non lues
 */
router.get('/api/notifications/unread', auth, notifController.countUnread);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes lues
 */
router.put('/api/notifications/read-all', auth, notifController.markAllRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notification lue
 */
router.put('/api/notifications/:id/read', auth, notifController.markOneRead);

// Route dev uniquement — déclenche le scheduler immédiatement
if (process.env.ENV === 'development') {
    const { runSchedulerNow } = require('../services/notification.scheduler');
    router.post('/api/dev/run-scheduler', async (req, res) => {
        try {
            await runSchedulerNow();
            res.json({ message: 'Scheduler exécuté avec succès.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
}

module.exports = router;
