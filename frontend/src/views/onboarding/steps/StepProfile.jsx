import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader, RadioRow } from '../components';
import { PROFILES } from '../data';

function MinorBlockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function StepProfile({ value, onChange, onNext, onBack, onLogoClick, progress }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);

  const selectedProfile = PROFILES.find((p) => p.id === value);

  const handleNext = () => {
    if (selectedProfile?.minorBlocked) {
      setBlocked(true);
      return;
    }
    onNext();
  };

  if (blocked) {
    return (
      <>
        <OnboardingHeader onBack={() => setBlocked(false)} onLogoClick={onLogoClick} progress={progress} />
        <div className="flex-1 w-full max-w-xl mx-auto px-5 py-7 lg:px-8 lg:py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-light text-brand-interaction flex items-center justify-center mb-5">
            <MinorBlockIcon />
          </div>
          <h1 className="text-2xl font-bold text-anthracite mb-2">{t('profile.minor_block.title')}</h1>
          <p className="text-secondary text-sm mb-8 max-w-sm">{t('profile.minor_block.text')}</p>

          <div className="mt-auto w-full flex flex-col gap-3">
            <Button
              variant="primary"
              full
              onClick={() => navigate('/dashboard', { state: { openAddChild: true } })}
            >
              {t('profile.minor_block.cta_parent')}
            </Button>
            <Button
              variant="secondary"
              full
              onClick={() => navigate('/login')}
            >
              {t('profile.minor_block.cta_existing')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <OnboardingHeader onBack={onBack} onLogoClick={onLogoClick} progress={progress} />
      <div className="flex-1 w-full max-w-xl mx-auto px-5 py-7 lg:px-8 lg:py-10 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">{t('profile.title')}</h1>
        <p className="text-secondary text-sm mb-6">{t('profile.subtitle')}</p>

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {PROFILES.map((p) => (
            <RadioRow
              key={p.id}
              selected={value === p.id}
              onSelect={() => onChange(p.id)}
              label={t(`profile.profiles.${p.id}.label`)}
              sub={t(`profile.profiles.${p.id}.sub`)}
              img={p.img}
              color={p.color}
              bg={p.bg}
            />
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button variant="primary" full disabled={!value} onClick={handleNext}>
            {t('profile.next')}
          </Button>
        </div>
      </div>
    </>
  );
}
