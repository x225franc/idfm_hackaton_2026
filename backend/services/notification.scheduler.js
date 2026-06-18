const cron = require('node-cron');
const notifModel = require('../models/notification.model');
const userModel = require('../models/user.model');
const transporter = require('../config/mailer');
const EmailTemplate = require('../components/emailTemplate');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MAIL_FROM    = process.env.MAIL_USER    || 'noreply@comutitres.fr';
const LOGO_URL     = `${FRONTEND_URL}/logo.png`;

// Age thresholds that trigger a "changement de tranche d'âge" notification
const AGE_TRANSITIONS = [
    {
        age: 4,
        titre: 'Votre enfant peut bénéficier de l\'Imagine R Junior',
        message: (firstName) =>
            `${firstName} vient d'avoir 4 ans. Il peut désormais bénéficier de l'abonnement Imagine R Junior pour circuler en Île-de-France. Rendez-vous dans votre espace pour faire la demande.`,
        forfaitSuggere: 'Imagine R Junior',
    },
    {
        age: 11,
        titre: 'Passage à l\'Imagine R Scolaire',
        message: (firstName) =>
            `${firstName} vient d'avoir 11 ans. Son abonnement peut maintenant passer à l'Imagine R Scolaire. Pensez à renouveler son titre de transport.`,
        forfaitSuggere: 'Imagine R Scolaire',
    },
    {
        age: 15,
        titre: 'Passage à l\'Imagine R Étudiant',
        message: (firstName) =>
            `${firstName} vient d'avoir 15 ans. Il ou elle peut désormais prétendre à l'abonnement Imagine R Étudiant. Connectez-vous pour mettre à jour le forfait.`,
        forfaitSuggere: 'Imagine R Etudiant',
    },
    {
        age: 26,
        titre: 'Fin des droits étudiant — passez au Navigo Annuel',
        message: (firstName) =>
            `${firstName} vient d'avoir 26 ans. Les tarifs étudiants arrivent à leur terme. Il est temps de basculer vers le Navigo Annuel au tarif actif.`,
        forfaitSuggere: 'Navigo Annuel',
    },
    {
        age: 62,
        titre: 'Proposition de passage au tarif Senior',
        message: (firstName) =>
            `${firstName} vient d'avoir 62 ans. Un passage automatique sur le Navigo Senior vous est proposé, avec les conditions tarifaires associées. Connectez-vous pour valider.`,
        forfaitSuggere: 'Navigo Senior',
    },
];

async function sendEmail(to, subject, text1, text2) {
    try {
        await transporter.sendMail({
            from: `"Comutitres" <${MAIL_FROM}>`,
            to,
            subject,
            html: EmailTemplate({
                url: FRONTEND_URL,
                logo: LOGO_URL,
                mail: MAIL_FROM,
                text1,
                text2,
                link: `<a href="${FRONTEND_URL}/dashboard">Accéder à mon espace</a>`,
            }),
        });
    } catch (err) {
        console.error(`[Notification] Erreur envoi email à ${to}:`, err.message);
    }
}

// ─── Renewal reminders ───────────────────────────────────────────────────────

async function processRenewalReminder(days) {
    const typeMap = {
        30: 'renouvellement_1_mois',
        7:  'renouvellement_1_semaine',
        1:  'renouvellement_1_jour',
    };
    const type = typeMap[days];

    const forfaits = await notifModel.getForfaitsExpiringInDays(days);

    for (const f of forfaits) {
        // Dedup: skip if already sent for this forfait+type
        const existing = await notifModel.existsForForfait(f.forfait_id, type);
        if (existing.length > 0) continue;

        const delayLabel =
            days === 30 ? 'dans 1 mois' :
            days === 7  ? 'dans 1 semaine' :
                          'demain';

        const titre   = `Votre ${f.type_forfait} expire ${delayLabel}`;
        const message = `Votre abonnement ${f.type_forfait} arrive à expiration le ${formatDate(f.date_fin)}. Pensez à le renouveler pour ne pas interrompre vos droits de circulation.`;

        await notifModel.create(f.compte_id, type, titre, message, f.forfait_id);

        await sendEmail(
            f.email,
            titre,
            `Bonjour ${f.firstName},`,
            message
        );

        console.log(`[Notification] Rappel renouvellement (${days}j) → compte ${f.compte_id}, forfait #${f.forfait_id}`);
    }
}

// ─── Age-transition notifications ────────────────────────────────────────────

async function processAgeTransitions() {
    for (const transition of AGE_TRANSITIONS) {
        const profiles = await notifModel.getProfilesWithBirthdayAndAge(transition.age);

        for (const p of profiles) {
            // Dedup: one per compte+type per day
            const existing = await notifModel.existsForCompteToday(p.compte_id, 'changement_tranche_age');
            if (existing.length > 0) continue;

            const message = transition.message(p.firstName);

            await notifModel.create(
                p.compte_id,
                'changement_tranche_age',
                transition.titre,
                message,
                null
            );

            await sendEmail(
                p.email,
                transition.titre,
                `Bonjour ${p.firstName},`,
                message
            );

            console.log(`[Notification] Transition âge ${transition.age} ans → compte ${p.compte_id}`);
        }
    }
}

// ─── Passage à 16 ans révolus : le proche redevient un compte normal ────────

async function processComingOfAge() {
    const profiles = await notifModel.getMinorsTurning16Today();

    for (const p of profiles) {
        await userModel.setMinorStatus(p.compte_id, false);

        const titre = 'Vous avez 16 ans : votre compte est désormais autonome';
        const message = `${p.firstName}, vous venez d'avoir 16 ans. Vous gérez maintenant votre compte Comutitres comme un compte normal : vous pouvez ajouter vos propres proches et gérer votre abonnement en toute autonomie.`;

        await notifModel.create(p.compte_id, 'changement_tranche_age', titre, message, null);
        await sendEmail(p.email, titre, `Bonjour ${p.firstName},`, message);

        console.log(`[Notification] Passage à 16 ans révolus (compte normal) → compte ${p.compte_id}`);
    }
}

// ─── Scheduler entry point ────────────────────────────────────────────────────

function startNotificationScheduler() {
    // Every day at 08:00
    cron.schedule('0 8 * * *', async () => {
        console.log('[Scheduler] Vérification des notifications quotidiennes...');
        try {
            await processRenewalReminder(30);
            await processRenewalReminder(7);
            await processRenewalReminder(1);
            await processAgeTransitions();
            await processComingOfAge();
            console.log('[Scheduler] Notifications traitées.');
        } catch (err) {
            console.error('[Scheduler] Erreur:', err.message);
        }
    });

    console.log('[Scheduler] Planificateur de notifications démarré (quotidien à 08h00).');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

async function runSchedulerNow() {
    console.log('[Scheduler] Déclenchement manuel...');
    await processRenewalReminder(30);
    await processRenewalReminder(7);
    await processRenewalReminder(1);
    await processAgeTransitions();
    await processComingOfAge();
    console.log('[Scheduler] Terminé.');
}

module.exports = { startNotificationScheduler, runSchedulerNow };
