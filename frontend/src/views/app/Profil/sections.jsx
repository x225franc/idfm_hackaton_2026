import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import {
  IconChevronRight,
  IconShieldCheck,
  IconIdBadge2,
  IconCamera,
  IconUpload,
  IconLock,
  IconClock,
  IconCheck,
  IconX,
  IconFileDescription,
} from '@tabler/icons-react';

const DOC_STATUS = {
  'Validé':     { labelKey: 'profil.doc_status.valid',    className: 'bg-[#EDFAF3] text-success',    Icon: IconCheck },
  'En attente': { labelKey: 'profil.doc_status.pending',  className: 'bg-warning-light text-warning', Icon: IconClock },
  'Refusé':     { labelKey: 'profil.doc_status.refused',  className: 'bg-[#FFF0F0] text-danger',      Icon: IconX     },
};

const DOC_ICONS = {
  "Pièce d'identité":      IconIdBadge2,
  "Photo d'identité":      IconCamera,
  "Attestation de bourse": IconFileDescription,
  "Justificatif TST":      IconFileDescription,
};

function DocStatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = DOC_STATUS[status] ?? DOC_STATUS['En attente'];
  const { Icon } = cfg;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.className}`}>
      <Icon size={11} stroke={2.5} />
      {t(cfg.labelKey)}
    </span>
  );
}

export function InfoRow({ label, value, onClick }) {
  const editable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!editable}
      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${editable ? 'hover:bg-surface cursor-pointer' : 'cursor-default'}`}
    >
      <div>
        <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-medium text-anthracite">{value || '—'}</p>
      </div>
      {editable && <IconChevronRight size={18} stroke={2} className="text-secondary shrink-0" />}
    </button>
  );
}

function IdentityField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-anthracite">{value || '—'}</p>
    </div>
  );
}

function IdentityNote({ verified }) {
  const { t } = useTranslation();
  return (
    <div className="mt-3">
      {verified ? (
        <div className="flex items-start gap-2 bg-surface rounded-xl px-3 py-2.5 text-[11px] text-secondary italic leading-relaxed">
          <IconLock size={12} stroke={2} className="shrink-0 mt-0.5" />
          <span>{t('profil.identity_locked_note')}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-surface rounded-xl px-3 py-2.5 text-[11px] text-secondary leading-relaxed">
          <span className="font-bold shrink-0 mt-0.5">*</span>
          <span>{t('profil.identity_note')}</span>
        </div>
      )}
    </div>
  );
}

export function IdentitySection({ profile, user, dob, isIdentityVerified, onEdit }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary">{t('profil.identity_section')}</h2>
        {isIdentityVerified && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-interaction bg-blue-light px-2.5 py-1 rounded-full">
            <IconShieldCheck size={11} stroke={2.5} />
            {t('profil.verified_badge')}
          </span>
        )}
      </div>

      {isIdentityVerified ? (
        <div className="bg-white rounded-2xl border border-border p-4 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <IdentityField label={t('profil.fields.first_name')} value={profile?.firstName ?? user?.firstName} />
            <IdentityField label={t('profil.fields.last_name')}  value={profile?.lastName  ?? user?.lastName}  />
          </div>
          <IdentityField label={t('profil.fields.birth_date')} value={dob ?? '—'} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs divide-y divide-border">
          <InfoRow label={t('profil.fields.first_name')} value={profile?.firstName ?? user?.firstName} onClick={() => onEdit('identity')} />
          <InfoRow label={t('profil.fields.last_name')}  value={profile?.lastName  ?? user?.lastName}  onClick={() => onEdit('identity')} />
          <InfoRow label={t('profil.fields.birth_date')} value={dob ?? '—'}                            onClick={() => onEdit('identity')} />
        </div>
      )}

      <IdentityNote verified={isIdentityVerified} />
    </>
  );
}

export function JustificatifsSection({ documents, onUpload }) {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary mb-2 px-1">{t('profil.docs_section')}</h2>
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        {documents === null ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />)}
          </div>
        ) : documents.length > 0 ? (
          <>
            <div className="divide-y divide-border">
              {documents.map((doc) => {
                const Icon = DOC_ICONS[doc.type_document] ?? IconFileDescription;
                const uploadDate = doc.uploadedAt
                  ? new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: '2-digit', year: 'numeric' })
                  : null;
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center shrink-0 text-brand-interaction">
                      <Icon size={20} stroke={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-anthracite leading-snug">{doc.type_document}</p>
                      {uploadDate && <p className="text-xs text-secondary mt-0.5">{t('profil.sent_on', { date: uploadDate })}</p>}
                    </div>
                    <DocStatusBadge status={doc.statut_verification} />
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="secondary" full onClick={onUpload}>
                <IconUpload size={16} stroke={2} />
                {t('profil.update_doc')}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <p className="text-secondary text-sm">{t('profil.no_docs')}</p>
            <Button variant="secondary" full onClick={onUpload}>
              <IconUpload size={16} stroke={2} />
              {t('profil.upload_doc')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
