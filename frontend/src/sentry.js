import * as Sentry from '@sentry/react';

// GlitchTip est un clone open-source self-hosted de Sentry : même SDK, même protocole,
// on pointe juste le DSN vers notre instance (services glitchtip_* du docker-compose).
const dsn = window.config?.GLITCHTIP_DSN_FRONTEND;

if (dsn) {
  Sentry.init({
    dsn,
    environment: window.config?.ENV || 'development',
    tracesSampleRate: 0.01,
    autoSessionTracking: false, // GlitchTip ne supporte pas les sessions
  });
  console.log('[GlitchTip] Suivi des erreurs frontend activé.');
} else {
  console.log('[GlitchTip] GLITCHTIP_DSN_FRONTEND non défini — suivi des erreurs désactivé.');
}

export default Sentry;
