import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader, RadioRow } from '../components';
import { PROFILES } from '../data';

export default function StepProfile({ value, onChange, onNext, onBack, progress }) {
  const { t } = useTranslation();

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
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
          <Button variant="primary" full disabled={!value} onClick={onNext}>
            {t('profile.next')}
          </Button>
        </div>
      </div>
    </>
  );
}
