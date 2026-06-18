const Sentry = require('@sentry/node');

if (process.env.GLITCHTIP_DSN_BACKEND) {
    Sentry.init({
        dsn: process.env.GLITCHTIP_DSN_BACKEND,
        environment: process.env.ENV || 'development',
        tracesSampleRate: 0.01,
        autoSessionTracking: false, 
    });
    console.log('[GlitchTip] Suivi des erreurs backend activé.');
} else {
    console.log('[GlitchTip] GLITCHTIP_DSN_BACKEND non défini — suivi des erreurs désactivé.');
}

module.exports = Sentry;
