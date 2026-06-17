import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader, RadioRow } from '../components';
import { FREQUENCIES } from '../data';

export default function StepFrequency({ value, onChange, onNext, onBack, progress }) {
  const { t } = useTranslation();

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">{t('frequency.title')}</h1>
        <p className="text-secondary text-sm mb-6">{t('frequency.subtitle')}</p>

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {FREQUENCIES.map((f) => (
            <RadioRow
              key={f.id}
              selected={value === f.id}
              onSelect={() => onChange(f.id)}
              label={t(`frequency.options.${f.id}`)}
            />
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button variant="primary" full disabled={!value} onClick={onNext}>
            {t('frequency.next')}
          </Button>
        </div>
      </div>
    </>
  );
}
