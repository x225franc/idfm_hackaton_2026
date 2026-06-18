import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingSidebar } from './components';
import StepWelcome from './steps/StepWelcome';
import StepProfile from './steps/StepProfile';
import StepFrequency from './steps/StepFrequency';
import StepOffer from './steps/StepOffer';
import StepDocuments from './steps/StepDocuments';
import StepPayment from './steps/StepPayment';
import StepSuccess from './steps/StepSuccess';

export const STEPS = ['welcome', 'profile', 'frequency', 'offer', 'documents', 'payment', 'success'];

const PROGRESS_STEPS = ['profile', 'frequency', 'offer', 'documents', 'payment'];


export default function Onboarding() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!localStorage.getItem('token') && !!storedUser;

  const [stepIndex, setStepIndex] = useState(
    state?.startStep != null ? state.startStep : isLoggedIn ? 1 : 0
  );

  // Arrivée directe depuis la page /offres (carte retournée → "Souscrire") :
  // le profil et l'offre choisis sont déjà connus, on les pré-remplit.
  const [data, setData] = useState({
    profile: state?.profile ?? '',
    frequency: '',
    offerId: state?.offerId ?? '',
    documents: isLoggedIn ? {
      firstName: storedUser.firstName ?? '',
      lastName:  storedUser.lastName  ?? '',
      email:     storedUser.email     ?? '',
    } : {},
    paymentMethod: 'cb',
  });

  const STEP_LABELS = {
    profile:   t('steps.profile'),
    frequency: t('steps.frequency'),
    offer:     t('steps.offer'),
    documents: t('steps.documents'),
    payment:   t('steps.payment'),
  };

  const step = STEPS[stepIndex];
  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = isLoggedIn && stepIndex === 1 ? undefined : () => setStepIndex((i) => Math.max(0, i - 1));
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
            isLoggedIn={isLoggedIn}
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
        return (
          <StepSuccess
            profile={data.profile}
            frequency={data.frequency}
            offerId={data.offerId}
            isLoggedIn={isLoggedIn}
            email={data.documents.email}
          />
        );

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

      {/*
        Panneau de contenu : pas de "carte" unique à largeur fixe pour toutes les étapes.
        Chaque étape (StepProfile, StepOffer, etc.) définit elle-même sa largeur de contenu
        (via max-w + mx-auto) selon ce qu'elle affiche. Pas de scroll interne ici : si le contenu
        dépasse la hauteur de l'écran, c'est la page (donc le navigateur) qui scrolle, pas ce bloc.
      */}
      <main className="flex-1 bg-white min-h-screen flex flex-col">
        {renderStep()}
      </main>
    </div>
  );
}
