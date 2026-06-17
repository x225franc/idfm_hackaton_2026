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

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const API_BASE = window.config?.BACKEND_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    if (!form.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions générales et la politique de confidentialité.';

    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }

    setLoading(true); 
    setApiError(null); 
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/add/user`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: form.firstName, 
          lastName: form.lastName, 
          email: form.email, 
          password: form.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetch(`${API_BASE}/api/send-verification-email`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        });
        
        setVerificationMode(true);
      } else {
        setApiError(data.message || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) { 
      setApiError('Impossible de joindre le serveur backend.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE}/api/verify-email?token=${verificationCode}`, { method: 'POST' });
      if (response.ok) {
        setVerificationMode(false);
        setSuccess(true);
      } else {
        setApiError("Le code saisi est invalide ou expiré.");
      }
    } catch (err) { 
      setApiError("Erreur lors de la vérification."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center px-4 py-3 border-b border-border sticky top-0 z-10 bg-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg text-anthracite hover:bg-surface transition-colors" aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="flex-1 flex justify-center"><Logo size="md" /></div>
        <div className="w-9" />
      </header>

      <div className="flex-1 px-5 py-7 w-full max-w-lg mx-auto">
        <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">Créer un compte</h1>
        {!verificationMode && !success && (
          <p className="text-secondary text-base mb-8">
            Inscrivez-vous pour configurer votre identifiant Île-de-France Mobilités Connect.
          </p>
        )}
        
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm font-medium flex gap-2">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {apiError}
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-[#EDFAF3] border border-success text-center mt-4">
            <p className="font-bold text-success text-lg mb-2">Compte vérifié avec succès !</p>
            <p className="text-secondary text-sm mb-6">Votre profil est prêt à être utilisé. Vous pouvez désormais vous connecter.</p>
            <Link to="/login"><Button variant="primary" full>Aller à la connexion</Button></Link>
          </div>
        ) : verificationMode ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-5 mt-4">
            <div className="bg-blue-50 text-[#0050AA] p-4 rounded-xl border border-blue-200 text-center mb-2">
              <p className="font-semibold mb-1">Code envoyé !</p>
              <p className="text-sm">Pour finaliser votre inscription, veuillez saisir le code à 6 caractères envoyé à <b>{form.email}</b>.</p>
            </div>
            <Input
              label="Code de vérification"
              type="text"
              name="verificationCode"
              placeholder="Ex: A1B2C3"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.toUpperCase());
                setApiError(null);
              }}
              required
              maxLength={6}
            />
            <Button type="submit" variant="primary" full disabled={loading || verificationCode.length < 6}>
              {loading ? 'Vérification...' : 'Valider mon compte'}
            </Button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" type="text" name="firstName" placeholder="Jean" value={form.firstName} onChange={handleChange} required />
                <Input label="Nom" type="text" name="lastName" placeholder="Dupont" value={form.lastName} onChange={handleChange} required />
              </div>
              <Input label="Email" type="email" name="email" placeholder="jean@exemple.com" value={form.email} onChange={handleChange} required />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-anthracite uppercase tracking-widest">Mot de passe</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                    className="w-full rounded-xl border border-border py-3.5 px-4 pr-12 text-anthracite text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow" 
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-anthracite transition-colors">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-anthracite uppercase tracking-widest">Confirmer le mot de passe</label>
                <input 
                  name="confirmPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  placeholder="••••••••" 
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                  className={`w-full rounded-xl border py-3.5 px-4 text-anthracite text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow ${errors.confirmPassword ? 'border-danger' : 'border-border'}`} 
                />
                {errors.confirmPassword && <p className="text-danger text-sm">{errors.confirmPassword}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-page cursor-pointer hover:border-brand transition-colors">
                  <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} className="mt-0.5 w-4 h-4 rounded border-border accent-brand flex-shrink-0" />
                  <span className="text-sm text-secondary leading-relaxed">
                    J'accepte les <Link to="/cgu" className="text-brand-interaction font-medium hover:underline">conditions générales d'utilisation</Link> et la <Link to="/privacy" className="text-brand-interaction font-medium hover:underline">politique de confidentialité</Link>.
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-danger text-sm mt-1">{errors.acceptTerms}</p>}
              </div>

              <Button type="submit" variant="primary" full className="mt-1" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

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
          </>
        )}
      </div>
    </div>
  );
}