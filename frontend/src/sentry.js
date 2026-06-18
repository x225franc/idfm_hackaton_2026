import * as Sentry from '@sentry/react';


const dsn = window.config?.GLITCHTIP_DSN_FRONTEND;

if (dsn) {
  Sentry.init({
    dsn,
    environment: window.config?.ENV || 'development',
    tracesSampleRate: 0.01,
    autoSessionTracking: false, 
  });
  console.log('[GlitchTip] Suivi des erreurs frontend activé.');
} else {
  console.log('[GlitchTip] GLITCHTIP_DSN_FRONTEND non défini — suivi des erreurs désactivé.');
}

export default Sentry;
