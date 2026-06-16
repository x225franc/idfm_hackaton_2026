import { useState } from 'react';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { PAYMENT_METHODS, OFFERS, getOffers } from '../data';

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function PaymentIcon({ id }) {
  if (id === 'cb') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (id === 'prelevement') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function StepPayment({ profile, frequency, offerId, value, onChange, onNext, onBack, progress }) {
  const [processing, setProcessing] = useState(false);
  const { recommended } = getOffers(profile, frequency);
  const offer = OFFERS[offerId] || recommended;

  const handlePay = async () => {
    setProcessing(true);
    // TODO: brancher un vrai prestataire de paiement (Stripe, etc.) une fois disponible côté backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProcessing(false);
    onNext();
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Paiement sécurisé</h1>
        <p className="text-secondary text-sm mb-6">
          Choisissez votre moyen de paiement pour finaliser votre abonnement.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                value === m.id ? 'border-brand bg-blue-light' : 'border-border hover:border-secondary/30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  value === m.id ? 'bg-brand text-white' : 'bg-surface text-secondary'
                }`}
              >
                <PaymentIcon id={m.id} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-anthracite text-sm">{m.label}</p>
                <p className="text-secondary text-xs">{m.sub}</p>
              </div>
              <span
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: value === m.id ? '#6485F6' : '#DDDDDD' }}
              >
                {value === m.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
            <span className="text-secondary font-medium">Total à payer</span>
            <span className="text-xl font-black text-anthracite">{formatPrice(offer.price)} €</span>
          </div>
          <Button variant="primary" full disabled={!value || processing} onClick={handlePay}>
            {processing ? (
              'Paiement en cours…'
            ) : (
              <>
                <LockIcon /> Payer {formatPrice(offer.price)} €
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
