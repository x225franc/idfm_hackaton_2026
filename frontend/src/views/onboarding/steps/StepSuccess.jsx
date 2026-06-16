import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import { OFFERS, getOffers } from '../data';

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

export default function StepSuccess({ profile, frequency, offerId }) {
  const navigate = useNavigate();
  const { recommended } = getOffers(profile, frequency);
  const offer = OFFERS[offerId] || recommended;

  return (
    <>
      <header className="flex items-center justify-center px-4 py-3 border-b border-border lg:hidden">
        <Logo size="md" />
      </header>

      <div className="flex-1 px-6 py-10 lg:px-10 lg:py-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mb-6 shadow-md">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-anthracite mb-2">Votre abonnement est activé !</h1>
        <p className="text-secondary text-sm mb-8">Un récapitulatif vous a été envoyé par email.</p>

        <div className="w-full border border-border rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-info text-brand-interaction flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M13 6v12" strokeDasharray="2 2" />
              </svg>
            </div>
            <p className="font-bold text-anthracite">{offer.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs uppercase tracking-wide mb-0.5">Prix Total</p>
              <p className="text-lg font-black text-anthracite">
                {formatPrice(offer.price)} €<span className="text-sm font-medium text-secondary">/{offer.period}</span>
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#EDFAF3] text-success">
              Payé
            </span>
          </div>
        </div>

        <p className="text-secondary text-sm mb-1">Besoin d'aide pour votre abonnement ?</p>
        <Link to="/contact" className="text-brand-interaction font-semibold text-sm hover:underline mb-8">
          Nous contacter
        </Link>

        {/* TODO: rediriger vers /compte une fois l'espace personnel utilisateur disponible */}
        <div className="mt-auto w-full">
          <Button variant="primary" full onClick={() => navigate('/login')}>
            Voir mon compte
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}
