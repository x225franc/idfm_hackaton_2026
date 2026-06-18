import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { getOffers } from '../data';

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2 text-xs text-anthracite">
      <svg className="text-success shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function EligibilityNote({ children }) {
  return (
    <div className="flex items-start gap-1.5 mt-auto pt-3 border-t border-border/70 text-[11px] text-secondary leading-relaxed">
      <svg className="shrink-0 mt-0.5 text-secondary/70" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default function StepOffer({ profile, frequency, value, onChange, onNext, onBack, onLogoClick, progress }) {
  const { t } = useTranslation();
  const { offers, recommended } = getOffers(profile, frequency);
  const selected = value || recommended.id;

  // Pré-sélectionne l'offre recommandée par défaut quand on arrive sur l'étape.
  useEffect(() => {
    if (!value) onChange(recommended.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPerks = (offer) => {
    const translated = t(`offer.offers.${offer.id}.perks`, { returnObjects: true });
    return Array.isArray(translated) ? translated : offer.perks;
  };

  // 3 offres ou plus → grille à 3 colonnes + contenu plus large, pour tout loger sur une
  // seule ligne plutôt que d'empiler et déclencher un scroll (largeur propre à cette étape).
  const isMultiCard = offers.length >= 3;
  const gridColsClass = isMultiCard ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  const maxWidthClass = isMultiCard ? 'max-w-3xl' : 'max-w-xl';

  return (
    <>
      <OnboardingHeader onBack={onBack} onLogoClick={onLogoClick} progress={progress} />
      <div className={`flex-1 w-full ${maxWidthClass} mx-auto px-5 py-6 lg:px-8 lg:py-10 flex flex-col`}>
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">{t('offer.title')}</h1>
        <p className="text-secondary text-sm mb-5">{t('offer.subtitle')}</p>

        <div className={`grid grid-cols-1 ${gridColsClass} gap-3 mb-4`}>
          {offers.map((offer) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => onChange(offer.id)}
              className={`text-left rounded-2xl border-2 p-4 transition-all cursor-pointer flex flex-col ${
                selected === offer.id ? 'border-brand shadow-md bg-blue-light' : 'border-border hover:border-secondary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2 min-h-5">
                {offer.recommended ? (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-interaction bg-blue-info px-2 py-0.5 rounded-full">
                    {t('offer.badge')}
                  </span>
                ) : <span />}
                <span
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: selected === offer.id ? '#6485F6' : '#DDDDDD' }}
                >
                  {selected === offer.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </span>
              </div>

              <p className="font-bold text-anthracite text-base mb-1">
                {t(`offer.offers.${offer.id}.name`, { defaultValue: offer.name })}
              </p>
              <p className="text-secondary text-xs mb-2 leading-relaxed">
                {t(`offer.offers.${offer.id}.desc`, { defaultValue: offer.desc })}
              </p>

              <p className="text-xl font-black text-anthracite mb-2">
                {offer.priceLabel ? (
                  t(`offer.offers.${offer.id}.priceLabel`, { defaultValue: offer.priceLabel })
                ) : (
                  <>
                    {formatPrice(offer.price)} €
                    <span className="text-xs font-medium text-secondary">
                      /{t(`offer.offers.${offer.id}.period`, { defaultValue: offer.period })}
                    </span>
                  </>
                )}
              </p>

              {offer.perks && (
                <ul className="flex flex-col gap-1 mb-1">
                  {getPerks(offer).slice(0, 1).map((perk) => (
                    <CheckItem key={perk}>{perk}</CheckItem>
                  ))}
                </ul>
              )}

              {/* Éligibilité affichée directement sur la carte, pour chaque offre */}
              <EligibilityNote>
                {t(`offer.offers.${offer.id}.eligibility`, { defaultValue: offer.eligibility })}
              </EligibilityNote>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button variant="primary" full onClick={onNext}>{t('offer.next')}</Button>
          <div className="text-center mt-3">
            <Link to="/offres" className="text-xs text-secondary hover:text-brand-interaction hover:underline transition-colors">
              Voir toutes les offres et leurs conditions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
