import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Sentry from './sentry';
import './index.css';
import './i18n';
import App from './App';

const container = document.getElementById('root');
const root = container._reactRoot ?? (container._reactRoot = ReactDOM.createRoot(container));

import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });


function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5 bg-white">
      <p className="text-2xl font-bold text-anthracite mb-2">Une erreur est survenue</p>
      <p className="text-secondary mb-6">Veuillez recharger la page.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-brand text-white rounded-xl py-3 px-6 font-semibold"
      >
        Recharger
      </button>
    </div>
  );
}

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);