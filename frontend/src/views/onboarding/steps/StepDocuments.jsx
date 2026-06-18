import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { getDocuments } from '../data';
import { PASSWORD_PATTERN, PHONE_PATTERN } from '@/validation';

function DocumentRow({ doc, file, onPick, onRemove }) {
  const { t } = useTranslation();
  const inputId = `doc-${doc.id}`;
  const label = t(`documents.docs.${doc.id}.label`, { defaultValue: doc.label });
  const hint  = t(`documents.docs.${doc.id}.hint`,  { defaultValue: doc.hint });

  return (
    <div className="border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-anthracite text-sm">{label}</p>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${doc.required ? 'bg-danger-light/20 text-danger' : 'bg-surface text-secondary'}`}>
          {t(doc.required ? 'documents.required_badge' : 'documents.optional_badge')}
        </span>
      </div>

      {file ? (
        <div className="flex items-center justify-between gap-3 bg-page rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="text-success shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm text-anthracite truncate">{file.name}</span>
          </div>
          <button type="button" onClick={onRemove} aria-label="Retirer le fichier" className="text-secondary hover:text-danger transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <label htmlFor={inputId} className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-xl py-3.5 cursor-pointer hover:border-brand hover:bg-blue-light/40 transition-colors">
          <svg className="text-brand-interaction" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm font-semibold text-brand-interaction">{t('documents.upload_cta')}</span>
          <span className="text-xs text-secondary">{hint}</span>
          <input id={inputId} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
        </label>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-secondary mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function StepDocuments({ profile, value, onChange, onNext, onBack, onLogoClick, progress, isLoggedIn }) {
  const { t } = useTranslation();
  const docs = getDocuments(profile);

  const requiredDocsOk = docs.every((d) => !d.required || value[d.id]);
  const requiredInfoOk = value.firstName && value.lastName && value.email && value.date_naissance
    && (isLoggedIn || !!value.password);
  const isReady = requiredDocsOk && requiredInfoOk;

  const handleChange = (e) => onChange({ ...value, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReady) onNext();
  };

  const inputClass = (readOnly) =>
    `w-full px-3 py-2.5 rounded-xl border border-border outline-none transition-colors ${readOnly ? 'bg-surface text-secondary cursor-default' : 'bg-page focus:bg-white focus:border-brand'}`;

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
      <OnboardingHeader onBack={onBack} onLogoClick={onLogoClick} progress={progress} />
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-7 lg:px-8 lg:py-10 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">{t('documents.title')}</h1>
        <p className="text-secondary text-sm mb-6">{t('documents.subtitle')}</p>

        {/* Section 1 : informations personnelles, sur 3 colonnes pour mieux utiliser la largeur disponible */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-anthracite mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-info text-brand-interaction flex items-center justify-center text-xs">1</span>
            {t('documents.section_identity')}
          </h2>

          {isLoggedIn && (
            <div className="flex items-center gap-2 mb-4 text-xs text-secondary bg-page rounded-xl px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              Informations pré-remplies depuis votre compte
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label={`${t('documents.firstName')} *`}>
              <input
                type="text" name="firstName" value={value.firstName || ''} onChange={handleChange}
                required readOnly={isLoggedIn}
                className={inputClass(isLoggedIn)}
                placeholder="Jean"
              />
            </Field>
            <Field label={`${t('documents.lastName')} *`}>
              <input
                type="text" name="lastName" value={value.lastName || ''} onChange={handleChange}
                required readOnly={isLoggedIn}
                className={inputClass(isLoggedIn)}
                placeholder="Dupont"
              />
            </Field>
            <Field label={`${t('documents.email')} *`}>
              <input
                type="email" name="email" value={value.email || ''} onChange={handleChange}
                required readOnly={isLoggedIn}
                className={inputClass(isLoggedIn)}
                placeholder="jean@email.com"
              />
            </Field>
            {!isLoggedIn && (
              <Field label={`${t('documents.password')} *`}>
                <input
                  type="password" name="password" value={value.password || ''} onChange={handleChange}
                  required
                  className={inputClass(false)}
                  placeholder="••••••••"
                  pattern={PASSWORD_PATTERN}
                />
              </Field>
            )}
            <Field label={`${t('documents.birthDate')} *`}>
              <input
                type="date" name="date_naissance" value={value.date_naissance || ''} onChange={handleChange}
                required className={inputClass(false)}
              />
            </Field>
            <Field label={t('documents.phone')}>
              <input
                type="tel" name="phoneNumber" value={value.phoneNumber || ''} onChange={handleChange}
                className={inputClass(false)} placeholder="06 xx xx xx xx" pattern={PHONE_PATTERN}
              />
            </Field>
          </div>
        </div>

        {/* Section 2 : justificatifs, sous la section 1, sur 2 colonnes quand il y a plusieurs documents */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-anthracite mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-info text-brand-interaction flex items-center justify-center text-xs">2</span>
            {t('documents.section_docs')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docs.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                file={value[doc.id]}
                onPick={(file) => onChange({ ...value, [doc.id]: file })}
                onRemove={() => onChange({ ...value, [doc.id]: null })}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 pb-2">
          <Button type="submit" variant="primary" full disabled={!isReady}>
            {t('documents.next')}
          </Button>
        </div>
      </div>
    </form>
  );
}
