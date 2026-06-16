import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { getOffers } from '../data';

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-anthracite">
      <svg className="text-success shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default function StepOffer({ profile, frequency, value, onChange, onNext, onBack, progress }) {
  const { recommended, alternative } = getOffers(profile, frequency);
  const selected = value || recommended.id;

  // Pré-sélectionne l'offre recommandée par défaut quand on arrive sur l'étape.
  useEffect(() => {
    if (!value) onChange(recommended.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Offre recommandée pour vous !</h1>
        <p className="text-secondary text-sm mb-6">
          Selon vos critères, voici l'offre qui vous correspond le mieux :
        </p>

        {/* Offre recommandée */}
        <button
          type="button"
          onClick={() => onChange(recommended.id)}
          className={`text-left rounded-2xl border-2 p-5 mb-4 transition-all cursor-pointer ${
            selected === recommended.id ? 'border-brand shadow-md bg-blue-light' : 'border-border'
          }`}
        >
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-interaction bg-blue-info px-2 py-0.5 rounded-full mb-3">
            Recommandé
          </span>
          <p className="font-bold text-anthracite text-lg mb-1">{recommended.name}</p>
          <p className="text-3xl font-black text-anthracite mb-3">
            {formatPrice(recommended.price)} €
            <span className="text-base font-medium text-secondary">/{recommended.period}</span>
          </p>
          {recommended.perks && (
            <ul className="flex flex-col gap-1.5 mb-3">
              {recommended.perks.map((perk) => (
                <CheckItem key={perk}>{perk}</CheckItem>
              ))}
            </ul>
          )}
          <span className="text-sm text-brand-interaction font-semibold hover:underline">
            Voir le détail de l'offre
          </span>
        </button>

        {/* Offre alternative */}
        <button
          type="button"
          onClick={() => onChange(alternative.id)}
          className={`text-left rounded-2xl border-2 p-5 transition-all cursor-pointer ${
            selected === alternative.id ? 'border-brand shadow-md bg-blue-light' : 'border-border'
          }`}
        >
          <p className="font-bold text-anthracite mb-1">{alternative.name}</p>
          <p className="text-secondary text-sm mb-2">{alternative.desc}</p>
          <p className="text-xl font-black text-anthracite">
            {formatPrice(alternative.price)} €
            <span className="text-sm font-medium text-secondary">/{alternative.period}</span>
          </p>
        </button>

        <div className="mt-auto pt-8">
          <Button variant="primary" full onClick={onNext}>Suivant</Button>
        </div>
      </div>
    </>
  );
}
