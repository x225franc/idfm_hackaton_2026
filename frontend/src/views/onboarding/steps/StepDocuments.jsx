import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { getDocuments } from '../data';

function DocumentRow({ doc, file, onPick, onRemove }) {
  const inputId = `doc-${doc.id}`;

  return (
    <div className="border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-anthracite text-sm">{doc.label}</p>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            doc.required ? 'bg-danger-light/20 text-danger' : 'bg-surface text-secondary'
          }`}
        >
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
          <button
            type="button"
            onClick={onRemove}
            aria-label="Retirer le fichier"
            className="text-secondary hover:text-danger transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-xl py-5 cursor-pointer hover:border-brand hover:bg-blue-light/40 transition-colors"
        >
          <svg className="text-brand-interaction" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm font-semibold text-brand-interaction">Cliquez pour charger</span>
          <span className="text-xs text-secondary">{doc.hint}</span>
          <input
            id={inputId}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => e.target.files[0] && onPick(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}

export default function StepDocuments({ profile, value, onChange, onNext, onBack, progress }) {
  const docs = getDocuments(profile);
  const requiredOk = docs.every((d) => !d.required || value[d.id]);

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Documents requis !</h1>
        <p className="text-secondary text-sm mb-6">
          Veuillez télécharger les documents suivants pour valider votre abonnement.
        </p>

        <div className="flex flex-col gap-3 mb-6 lg:grid lg:grid-cols-2">
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

        <p className="text-xs text-secondary leading-relaxed bg-page rounded-xl p-3 mb-2">
          Vos documents sont cryptés et stockés de manière sécurisée, conformément au RGPD, pour le traitement de votre dossier.
        </p>

        {/* TODO: envoyer les fichiers vers l'API (multipart) une fois la route backend disponible */}
        <div className="mt-auto pt-6">
          <Button variant="primary" full disabled={!requiredOk} onClick={onNext}>Suivant</Button>
        </div>
      </div>
    </>
  );
}
