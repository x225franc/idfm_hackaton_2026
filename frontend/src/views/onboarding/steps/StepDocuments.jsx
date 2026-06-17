import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { getDocuments } from '../data';

function DocumentRow({ doc, file, onPick, onRemove }) {
  const inputId = `doc-${doc.id}`;

  return (
    <div className="border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-anthracite text-sm">{doc.label}</p>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${doc.required ? 'bg-danger-light/20 text-danger' : 'bg-surface text-secondary'}`}>
          {doc.required ? 'Requis' : 'Optionnel'}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <label htmlFor={inputId} className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-xl py-5 cursor-pointer hover:border-brand hover:bg-blue-light/40 transition-colors">
          <svg className="text-brand-interaction" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm font-semibold text-brand-interaction">Cliquez pour charger</span>
          <span className="text-xs text-secondary">{doc.hint}</span>
          <input id={inputId} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
        </label>
      )}
    </div>
  );
}

export default function StepDocuments({ profile, value, onChange, onNext, onBack, progress }) {
  const docs = getDocuments(profile);
  
  // 1. Vérifie si tous les documents requis sont bien uploadés
  const requiredDocsOk = docs.every((d) => !d.required || value[d.id]);
  
  // 2. Vérifie si les informations personnelles obligatoires sont remplies
  const requiredInfoOk = value.firstName && value.lastName && value.email && value.password && value.date_naissance;
  
  // 3. Le bouton sera cliquable UNIQUEMENT si les deux conditions sont remplies
  const isReady = requiredDocsOk && requiredInfoOk;

  const handleChange = (e) => {
    onChange({ ...value, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche la page de se recharger
    // On avance uniquement si tout est prêt (sécurité supplémentaire)
    if (isReady) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col overflow-y-auto">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Création de votre dossier</h1>
        <p className="text-secondary text-sm mb-6">
          Nous avons besoin de quelques informations pour finaliser votre abonnement.
        </p>

        {/* --- FORMULAIRE IDENTITÉ (REQUIS) --- */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-anthracite mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-info text-brand-interaction flex items-center justify-center text-xs">1</span>
            Informations personnelles
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Prénom *</label>
              <input type="text" name="firstName" value={value.firstName || ''} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Nom *</label>
              <input type="text" name="lastName" value={value.lastName || ''} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" placeholder="Dupont" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Email *</label>
              <input type="email" name="email" value={value.email || ''} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" placeholder="jean@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Mot de passe *</label>
              <input type="password" name="password" value={value.password || ''} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" placeholder="••••••••" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Date de naissance *</label>
              <input type="date" name="date_naissance" value={value.date_naissance || ''} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Téléphone</label>
              <input type="tel" name="phoneNumber" value={value.phoneNumber || ''} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:bg-white focus:border-brand outline-none transition-colors" placeholder="06 xx xx xx xx" pattern="0[1-9][0-9]{8}" />
            </div>
          </div>
        </div>

        {/* --- DOCUMENTS --- */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-anthracite mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-info text-brand-interaction flex items-center justify-center text-xs">2</span>
            Justificatifs requis
          </h2>
          <div className="flex flex-col gap-3">
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
          {/* Le bouton est désactivé (grisé) tant que isReady est faux */}
          <Button type="submit" variant="primary" full disabled={!isReady}>Suivant</Button>
        </div>
      </div>
    </form>
  );
}