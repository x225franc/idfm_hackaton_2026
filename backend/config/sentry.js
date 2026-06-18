const Sentry = require('@sentry/node');

// GlitchTip est un clone open-source self-hosted de Sentry : même SDK, même protocole,
// on pointe juste le DSN vers notre instance (services glitchtip_* du docker-compose).
if (process.env.GLITCHTIP_DSN_BACKEND) {
    Sentry.init({
        dsn: process.env.GLITCHTIP_DSN_BACKEND,
        environment: process.env.ENV || 'development',
        tracesSampleRate: 0.01,
        autoSessionTracking: false, // GlitchTip ne supporte pas les sessions
    });
    console.log('[GlitchTip] Suivi des erreurs backend activé.');
} else {
    console.log('[GlitchTip] GLITCHTIP_DSN_BACKEND non défini — suivi des erreurs désactivé.');
}

module.exports = Sentry;
