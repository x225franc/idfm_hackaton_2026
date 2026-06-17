import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { OnboardingHeader } from '../components';

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function StepPersonal({ value, onChange, onNext, onBack, progress }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const fields = value || { firstName: '', lastName: '', email: '', password: '', birthDate: '' };

  const set = (key) => (e) => {
    onChange({ ...fields, [key]: e.target.value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!fields.firstName.trim()) next.firstName = 'Le prénom est requis.';
    if (!fields.lastName.trim()) next.lastName = 'Le nom est requis.';
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      next.email = 'Adresse e-mail invalide.';
    if (fields.password.length < 8) next.password = 'Au moins 8 caractères requis.';
    if (!fields.birthDate) next.birthDate = 'La date de naissance est requise.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const allFilled =
    fields.firstName && fields.lastName && fields.email && fields.password.length >= 8 && fields.birthDate;

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Vos informations personnelles</h1>
        <p className="text-secondary text-sm mb-6">Ces informations serviront à créer votre compte.</p>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              name="firstName"
              placeholder="Marie"
              value={fields.firstName}
              onChange={set('firstName')}
              error={errors.firstName}
              required
            />
            <Input
              label="Nom"
              name="lastName"
              placeholder="Dupont"
              value={fields.lastName}
              onChange={set('lastName')}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Adresse e-mail"
            type="email"
            name="email"
            placeholder="marie.dupont@email.fr"
            value={fields.email}
            onChange={set('email')}
            error={errors.email}
            required
          />

          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="8 caractères minimum"
            value={fields.password}
            onChange={set('password')}
            error={errors.password}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="cursor-pointer"
              >
                <EyeIcon open={showPassword} />
              </button>
            }
          />

          <Input
            label="Date de naissance"
            type="date"
            name="birthDate"
            value={fields.birthDate}
            onChange={set('birthDate')}
            error={errors.birthDate}
            required
          />
        </div>

        <div className="mt-auto pt-8">
          <Button variant="primary" full onClick={handleNext} disabled={!allFilled}>
            Suivant
          </Button>
        </div>
      </div>
    </>
  );
}
