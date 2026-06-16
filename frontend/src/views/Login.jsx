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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: appel API auth
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg text-anthracite hover:bg-surface transition-colors"
          aria-label="Retour"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="w-9" />
      </header>

      {/* ── Hero station ── */}
      <div className="h-52 sm:h-64 md:h-72 flex-shrink-0 overflow-hidden relative">
        {/* Ceiling */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4DCE8] via-[#9BAEC8] to-[#5A7BA8]" />
        {/* Arch windows suggestion */}
        <div className="absolute top-0 left-0 right-0 flex justify-around pt-4 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-12 h-20 rounded-t-full border-2 border-white/40 bg-white/10" />
          ))}
        </div>
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#3A5A88] to-transparent" />
        {/* Rails perspective */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-24 opacity-40" viewBox="0 0 400 96" preserveAspectRatio="none">
          <line x1="160" y1="96" x2="195" y2="0" stroke="white" strokeWidth="2" />
          <line x1="240" y1="96" x2="205" y2="0" stroke="white" strokeWidth="2" />
          <line x1="100" y1="96" x2="192" y2="0" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="300" y1="96" x2="208" y2="0" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>
        {/* Subtle figure in distance */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-2 h-8 bg-white/20 rounded-full" />
      </div>

      {/* ── Form ── */}
      <div className="flex-1 px-5 py-7 w-full max-w-lg mx-auto">
        <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">Connexion</h1>
        <p className="text-secondary text-base mb-8">
          Accédez à votre espace personnel Comutitres.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nom@exemple.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Password with inline label row */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold text-anthracite uppercase tracking-widest"
              >
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-brand-interaction font-medium hover:underline"
              >
                Mot de passe oublié
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border py-3.5 px-4 pr-12 text-anthracite text-base bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-anthracite transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" full className="mt-1">
            Se connecter
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-border" />
          <span className="text-secondary text-sm font-medium">OU</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link to="/register">
          <Button variant="secondary" full>
            Créer un compte
          </Button>
        </Link>

        <p className="text-center text-sm text-secondary mt-8">
          Besoin d'aide ?{' '}
          <Link to="/faq" className="text-brand-interaction font-medium hover:underline">
            Consulter la FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
