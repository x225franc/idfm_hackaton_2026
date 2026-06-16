import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = [
    { label: 'Faible', color: 'bg-danger' },
    { label: 'Moyen', color: 'bg-warning' },
    { label: 'Bon', color: 'bg-warning' },
    { label: 'Fort', color: 'bg-success' },
  ];
  const current = levels[score - 1] || levels[0];

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= score ? current.color : 'bg-border'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${score <= 1 ? 'text-danger' : score <= 3 ? 'text-warning' : 'text-success'}`}>
        {current.label}
      </span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errs.lastName = 'Nom requis';
    if (!form.email.trim()) errs.email = 'Email requis';
    if (form.password.length < 8) errs.password = '8 caractères minimum';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!form.acceptTerms) errs.acceptTerms = 'Veuillez accepter les conditions';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // TODO: appel API inscription
  };

  const PasswordInput = ({ id, label, show, onToggle, error }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold text-anthracite uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={form[id]}
          onChange={handleChange}
          required
          placeholder={id === 'password' ? '8 caractères minimum' : 'Répéter le mot de passe'}
          className={`w-full rounded-xl border py-3.5 px-4 pr-12 text-anthracite text-base bg-white placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow
            ${error ? 'border-danger' : 'border-border'}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-anthracite transition-colors"
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {id === 'password' && <PasswordStrength password={form.password} />}
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
        <Link
          to="/login"
          className="p-2 -ml-2 rounded-lg text-anthracite hover:bg-surface transition-colors"
          aria-label="Retour à la connexion"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="w-9" />
      </header>

      {/* ── Form ── */}
      <div className="flex-1 px-5 py-7 w-full max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">Créer un compte</h1>
          <p className="text-secondary text-base">
            Rejoignez Comutitres et gérez vos abonnements en toute simplicité.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              type="text"
              name="firstName"
              placeholder="Jean"
              value={form.firstName}
              onChange={handleChange}
              required
              error={errors.firstName}
            />
            <Input
              label="Nom"
              type="text"
              name="lastName"
              placeholder="Dupont"
              value={form.lastName}
              onChange={handleChange}
              required
              error={errors.lastName}
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nom@exemple.com"
            value={form.email}
            onChange={handleChange}
            required
            error={errors.email}
          />

          <PasswordInput
            id="password"
            label="Mot de passe"
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            error={errors.password}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirmer le mot de passe"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            error={errors.confirmPassword}
          />

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-border accent-brand flex-shrink-0"
              />
              <span className="text-sm text-secondary leading-relaxed">
                J'accepte les{' '}
                <Link to="/cgu" className="text-brand-interaction font-medium hover:underline">
                  conditions générales d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-brand-interaction font-medium hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-danger text-sm mt-1">{errors.acceptTerms}</p>
            )}
          </div>

          <Button type="submit" variant="primary" full className="mt-1">
            Créer mon compte
          </Button>
        </form>

        {/* Already have account */}
        <p className="text-center text-sm text-secondary mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-interaction font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-sm text-secondary mt-4">
          Besoin d'aide ?{' '}
          <Link to="/faq" className="text-brand-interaction font-medium hover:underline">
            Consulter la FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
