import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { IconUpload, IconX } from '@tabler/icons-react';

export default function ProfilModal({ modal, setModal, setField, handleSave }) {
  const { t } = useTranslation();

  const close = () => setModal(null);

  const SaveFooter = ({ submitLabel, submittingLabel }) => (
    <>
      <Button variant="outline" onClick={close}>{t('profil.modals.cancel')}</Button>
      <Button variant="primary" onClick={handleSave} disabled={modal?.saving}>
        {modal?.saving ? (submittingLabel ?? t('profil.modals.saving')) : (submitLabel ?? t('profil.modals.save'))}
      </Button>
    </>
  );

  return (
    <>
      <Modal open={modal?.type === 'phone'} onClose={close} title={t('profil.modals.phone.title')} footer={<SaveFooter />}>
        <div className="flex flex-col gap-4">
          {modal?.error && <p className="text-danger text-sm">{modal.error}</p>}
          <Input
            label={t('profil.fields.phone')}
            type="tel"
            placeholder="06 XX XX XX XX"
            value={modal?.values?.phoneNumber ?? ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              const formatted = digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
              setField('phoneNumber', formatted);
            }}
          />
        </div>
      </Modal>

      <Modal open={modal?.type === 'address'} onClose={close} title={t('profil.modals.address.title')} footer={<SaveFooter />}>
        <div className="flex flex-col gap-4">
          {modal?.error && <p className="text-danger text-sm">{modal.error}</p>}
          <Input
            label={t('profil.fields.street')}
            placeholder="24 avenue de la République"
            value={modal?.values?.address ?? ''}
            onChange={(e) => setField('address', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('profil.fields.postal_code')}
              placeholder="75011"
              value={modal?.values?.postalCode ?? ''}
              onChange={(e) => setField('postalCode', e.target.value)}
            />
            <Input
              label={t('profil.fields.city')}
              placeholder="Paris"
              value={modal?.values?.city ?? ''}
              onChange={(e) => setField('city', e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal open={modal?.type === 'password'} onClose={close} title={t('profil.modals.password.title')} footer={<SaveFooter />}>
        <div className="flex flex-col gap-4">
          {modal?.error && <p className="text-danger text-sm">{modal.error}</p>}
          <Input
            label={t('profil.modals.password.new')}
            type="password"
            placeholder="••••••••"
            value={modal?.values?.password ?? ''}
            onChange={(e) => setField('password', e.target.value)}
          />
          <Input
            label={t('profil.modals.password.confirm')}
            type="password"
            placeholder="••••••••"
            value={modal?.values?.confirmPassword ?? ''}
            onChange={(e) => setField('confirmPassword', e.target.value)}
          />
          <div className="flex items-start gap-2 bg-surface rounded-xl px-3 py-2.5 text-[11px] text-secondary leading-relaxed">
            <span className="font-bold shrink-0 mt-0.5">*</span>
            <span>{t('profil.validation.password_hint')}</span>
          </div>
        </div>
      </Modal>

      <Modal open={modal?.type === 'identity'} onClose={close} title={t('profil.modals.identity.title')} footer={<SaveFooter />}>
        <div className="flex flex-col gap-4">
          {modal?.error && <p className="text-danger text-sm">{modal.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('profil.fields.first_name')}
              placeholder="Jean"
              value={modal?.values?.firstName ?? ''}
              onChange={(e) => setField('firstName', e.target.value)}
            />
            <Input
              label={t('profil.fields.last_name')}
              placeholder="Dupont"
              value={modal?.values?.lastName ?? ''}
              onChange={(e) => setField('lastName', e.target.value)}
            />
          </div>
          <Input
            label={t('profil.fields.birth_date')}
            type="date"
            value={modal?.values?.date_naissance ?? ''}
            onChange={(e) => setField('date_naissance', e.target.value)}
          />
          <div className="flex items-start gap-2 bg-surface rounded-xl px-3 py-2.5 text-[11px] text-secondary leading-relaxed">
            <span className="font-bold shrink-0 mt-0.5">*</span>
            <span>{t('profil.identity_note')}</span>
          </div>
        </div>
      </Modal>

      <Modal
        open={modal?.type === 'documents'}
        onClose={close}
        title={t('profil.modals.documents.title')}
        footer={<SaveFooter submitLabel={t('profil.modals.documents.submit')} submittingLabel={t('profil.modals.documents.submitting')} />}
      >
        <div className="flex flex-col gap-4">
          {modal?.error && <p className="text-danger text-sm">{modal.error}</p>}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">{t('profil.modals.documents.type_label')}</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-page focus:border-brand outline-none text-sm"
              value={modal?.values?.type_document ?? ''}
              onChange={(e) => setField('type_document', e.target.value)}
            >
              <option value="">{t('profil.modals.documents.type_placeholder')}</option>
              <option value="Pièce d'identité">{t('profil.doc_types.identity')}</option>
              <option value="Photo d'identité">{t('profil.doc_types.photo')}</option>
              <option value="Attestation de bourse">{t('profil.doc_types.bourse')}</option>
              <option value="Justificatif TST">{t('profil.doc_types.tst')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">{t('profil.modals.documents.file_label')}</label>
            {modal?.values?.file ? (
              <div className="flex items-center justify-between gap-3 bg-surface rounded-xl px-3 py-2.5">
                <span className="text-sm text-anthracite truncate">{modal.values.file.name}</span>
                <button type="button" onClick={() => setField('file', null)} className="text-secondary hover:text-danger transition-colors shrink-0">
                  <IconX size={16} stroke={2} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-xl py-5 cursor-pointer hover:border-brand hover:bg-blue-light/40 transition-colors">
                <IconUpload size={20} className="text-brand-interaction" stroke={2} />
                <span className="text-sm font-semibold text-brand-interaction">{t('profil.modals.documents.pick_file')}</span>
                <span className="text-xs text-secondary">{t('profil.modals.documents.file_hint')}</span>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files[0] && setField('file', e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
