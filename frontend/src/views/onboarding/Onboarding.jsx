import { useState } from 'react';
import { OnboardingSidebar } from './components';
import StepWelcome from './steps/StepWelcome';
import StepProfile from './steps/StepProfile';
import StepFrequency from './steps/StepFrequency';
import StepOffer from './steps/StepOffer';
import StepDocuments from './steps/StepDocuments';
import StepPayment from './steps/StepPayment';
import StepSuccess from './steps/StepSuccess';

const STEPS = ['welcome', 'profile', 'frequency', 'offer', 'documents', 'payment', 'success'];

// Étapes affichant la barre de progression / le stepper desktop (on exclut l'accueil et la confirmation finale)
const PROGRESS_STEPS = ['profile', 'frequency', 'offer', 'documents', 'payment'];

const STEP_LABELS = {
  profile: 'Votre situation',
  frequency: 'Fréquence de trajet',
  offer: 'Votre offre',
  documents: 'Documents',
  payment: 'Paiement',
};

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({
    profile: '',
    frequency: '',
    offerId: '',
    documents: {},
    paymentMethod: 'cb',
  });

  const step = STEPS[stepIndex];
  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const progressIndex = PROGRESS_STEPS.indexOf(step); // -1 sur welcome/success
  const progress = progressIndex >= 0 ? ((progressIndex + 1) / PROGRESS_STEPS.length) * 100 : undefined;
  const goToStep = (targetStep) => setStepIndex(STEPS.indexOf(targetStep));

  const renderStep = () => {
    switch (step) {
      case 'profile':
        return (
          <StepProfile
            value={data.profile}
            onChange={(profile) => update({ profile })}
            onNext={goNext}
            onBack={goBack}
            progress={progress}
          />
        );

      case 'frequency':
        return (
          <StepFrequency
            value={data.frequency}
            onChange={(frequency) => update({ frequency })}
            onNext={goNext}
            onBack={goBack}
            progress={progress}
          />
        );

      case 'offer':
        return (
          <StepOffer
            profile={data.profile}
            frequency={data.frequency}
            value={data.offerId}
            onChange={(offerId) => update({ offerId })}
            onNext={goNext}
            onBack={goBack}
            progress={progress}
          />
        );

      case 'documents':
        return (
          <StepDocuments
            profile={data.profile}
            value={data.documents}
            onChange={(documents) => update({ documents })}
            onNext={goNext}
            onBack={goBack}
            progress={progress}
          />
        );

    case 'payment':
        return (
          <StepPayment 
            profile={data.profile} 
            frequency={data.frequency} 
            offerId={data.offerId}
            value={data.paymentMethod}
            userData={data.documents}
            onChange={(val) => update({ paymentMethod: val })}
            onNext={goNext}
            onBack={goBack}
            progress={100}
          />
        );

      case 'success':
        return <StepSuccess profile={data.profile} frequency={data.frequency} offerId={data.offerId} />;

      default:
        return null;
    }
  };

  if (step === 'welcome') {
    return <StepWelcome onNext={goNext} />;
  }

  return (
    <div className="min-h-screen bg-page lg:flex">
      <OnboardingSidebar
        steps={PROGRESS_STEPS}
        labels={STEP_LABELS}
        currentIndex={progressIndex}
        onGoTo={goToStep}
      />

      <main className="flex-1 flex justify-center lg:items-center lg:py-10 lg:px-8">
        <div className="w-full max-w-lg lg:max-w-xl bg-white min-h-screen lg:min-h-0 lg:max-h-[90vh] lg:rounded-3xl lg:shadow-xl lg:border lg:border-border flex flex-col lg:overflow-y-auto">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
