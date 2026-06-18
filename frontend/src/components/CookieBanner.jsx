import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem('cookie_consent', 'refused');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-secondary flex-1">
          Nous utilisons des cookies et collectons des données personnelles pour assurer le fonctionnement du service et améliorer votre expérience. Conformément au{' '}
          <span className="font-semibold text-anthracite">RGPD</span>, vous pouvez accepter ou refuser leur utilisation.{' '}
          <Link to="/faq" className="text-brand underline underline-offset-2">En savoir plus</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-secondary hover:border-secondary/50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-focus transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
