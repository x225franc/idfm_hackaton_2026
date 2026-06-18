import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const API_BASE = window.config?.BACKEND_URL;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        if (response.status === 401 && data.isVerified === 'NO') {
          setVerificationMode(true);
        } else {
          setError(data.message || t('login.errors.server'));
        }
      }
    } catch {
      setError(t('login.errors.server'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/verify-email?token=${verificationCode}`, { method: 'POST' });
      if (response.ok) {
        await handleSubmit();
      } else {
        setError(t('login.errors.invalid_code'));
      }
    } catch {
      setError(t('login.errors.verify_error'));
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
        <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">{t('login.title')}</h1>
        {!verificationMode && (
          <p className="text-secondary text-base mb-8">{t('login.subtitle')}</p>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm font-medium flex gap-2">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {verificationMode ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-5 mt-4">
            <div className="bg-blue-50 text-[#0050AA] p-4 rounded-xl border border-blue-200 text-center mb-2">
              <p className="font-semibold mb-1">{t('login.verification.title')}</p>
              <p className="text-sm">{t('login.verification.subtitle')}</p>
            </div>
            <Input
              label={t('login.verification.code_label')}
              type="text"
              name="verificationCode"
              placeholder={t('login.verification.code_placeholder')}
              value={verificationCode}
              onChange={(e) => { setVerificationCode(e.target.value.toUpperCase()); setError(null); }}
              required
              maxLength={6}
            />
            <Button type="submit" variant="primary" full disabled={loading || verificationCode.length < 6}>
              {loading ? t('login.verification.loading') : t('login.verification.submit')}
            </Button>
            <button type="button" onClick={() => setVerificationMode(false)} className="text-sm text-secondary hover:underline mt-2">
              {t('login.verification.cancel')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            <Input label={t('login.email')} type="email" name="email" value={form.email} onChange={handleChange} placeholder="nom@exemple.com" required />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-anthracite uppercase tracking-widest">{t('login.password')}</label>
                <Link to="/forgot-password" className="text-sm text-brand-interaction font-medium hover:underline">{t('login.forgot_password')}</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border py-3.5 px-4 pr-12 text-anthracite text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-anthracite transition-colors">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <Button type="submit" variant="primary" full disabled={loading} className="mt-1">
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>
        )}

        {!verificationMode && (
          <>
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-border" />
              <span className="text-secondary text-sm font-medium">{t('login.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Link to="/register">
              <Button variant="secondary" full>{t('login.register')}</Button>
            </Link>
            <p className="text-center text-sm text-secondary mt-8">
              {t('login.help')}{' '}
              <Link to="/faq" className="text-brand-interaction font-medium hover:underline">{t('login.faq')}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
