import Button from '@/components/ui/Button';
import { OnboardingHeader, RadioRow } from '../components';
import { FREQUENCIES } from '../data';

export default function StepFrequency({ value, onChange, onNext, onBack, progress }) {
  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">À quelle fréquence voyagez-vous ?</h1>
        <p className="text-secondary text-sm mb-6">
          Cela nous aidera à vous proposer l'abonnement le plus adapté à vos besoins.
        </p>

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {FREQUENCIES.map((f) => (
            <RadioRow
              key={f.id}
              selected={value === f.id}
              onSelect={() => onChange(f.id)}
              label={f.label}
            />
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button variant="primary" full disabled={!value} onClick={onNext}>Suivant</Button>
        </div>
      </div>
    </>
  );
}
