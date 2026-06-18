import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppShell from '@/components/app/AppShell';
import { apiFetch } from '@/utils';
import { PASSWORD_REGEX, PHONE_REGEX } from '@/validation';
import { IconLogout, IconUser, IconPencil, IconShieldCheck } from '@tabler/icons-react';
import { InfoRow, IdentitySection, JustificatifsSection } from './sections';
import ProfilModal from './Modal';
import { AuthContext } from '@/App';

export default function Profil() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [documents, setDocuments] = useState(null);
  const [modal, setModal]         = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(stored);
    if (!stored?.id) { setDocuments([]); return; }

    (async () => {
      try {
        const userData = await apiFetch(`/api/get/user/${stored.id}`);
        const [profiles, docs] = await Promise.all([
          apiFetch(`/api/profils/compte/${stored.id}`),
          userData.profil_id
            ? apiFetch(`/api/documents/profil/${userData.profil_id}`)
            : Promise.resolve([]),
        ]);
        setProfile(profiles?.[0] ?? null);
        setDocuments(docs);
      } catch (err) {
        if (err.message === '404') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setDocuments([]);
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openModal = (type) => {
    const init = {
      phone:    { phoneNumber: profile?.phoneNumber ?? '' },
      address:  { address: profile?.address ?? '', postalCode: profile?.postalCode ?? '', city: profile?.city ?? '' },
      password: { password: '', confirmPassword: '' },
      identity: {
        firstName:      profile?.firstName ?? user?.firstName ?? '',
        lastName:       profile?.lastName  ?? user?.lastName  ?? '',
        date_naissance: profile?.date_naissance ? String(profile.date_naissance).slice(0, 10) : '',
      },
      documents: { type_document: '', file: null },
    }[type];
    setModal({ type, values: init, saving: false, error: null });
  };

  const setField = (key, val) =>
    setModal((m) => ({ ...m, values: { ...m.values, [key]: val } }));

  const handleSave = async () => {
    setModal((m) => ({ ...m, saving: true, error: null }));
    try {
      const { type, values } = modal;

      if (type === 'password') {
        if (!PASSWORD_REGEX.test(values.password))
          throw new Error(t('profil.validation.password_error'));
        if (values.password !== values.confirmPassword)
          throw new Error(t('profil.validation.password_mismatch'));
        await apiFetch(`/api/update/user/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: values.password }),
        });

      } else if (type === 'phone') {
        if (!PHONE_REGEX.test(values.phoneNumber.replace(/\s/g, '')))
          throw new Error(t('profil.errors.phone_invalid'));
        await apiFetch(`/api/update/user/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: values.phoneNumber }),
        });
        setProfile((p) => ({ ...p, phoneNumber: values.phoneNumber }));

      } else if (type === 'address') {
        await apiFetch(`/api/update/user/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: values.address, postalCode: values.postalCode, city: values.city }),
        });
        setProfile((p) => ({ ...p, address: values.address, postalCode: values.postalCode, city: values.city }));

      } else if (type === 'identity') {
        const locked = documents?.some(
          d => d.type_document === "Pièce d'identité" && d.statut_verification === 'Validé'
        );
        if (locked) throw new Error(t('profil.errors.identity_locked'));
        await apiFetch(`/api/update/user/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: values.firstName, lastName: values.lastName, date_naissance: values.date_naissance }),
        });
        setProfile((p) => ({ ...p, firstName: values.firstName, lastName: values.lastName, date_naissance: values.date_naissance }));

      } else if (type === 'documents') {
        if (!values.type_document) throw new Error(t('profil.errors.no_doc_type'));
        if (!values.file) throw new Error(t('profil.errors.no_file'));
        const fd = new FormData();
        fd.append('profil_id', profile.id);
        fd.append('type_document', values.type_document);
        fd.append('images', values.file);
        await apiFetch('/api/documents/upload', { method: 'POST', body: fd });
        const docs = await apiFetch(`/api/documents/profil/${profile.id}`);
        setDocuments(docs);
      }

      setModal(null);
    } catch (err) {
      setModal((m) => ({ ...m, saving: false, error: err.message || t('profil.errors.generic') }));
    }
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const dob = profile?.date_naissance
    ? new Date(profile.date_naissance).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const address = profile
    ? [profile.address, profile.postalCode, profile.city].filter(Boolean).join(', ')
    : null;

  const isIdentityVerified = documents?.some(
    (doc) => doc.type_document === "Pièce d'identité" && doc.statut_verification === 'Validé'
  ) ?? false;

  const AvatarBlock = ({ size = 'lg' }) => (
    <div className={`flex flex-col items-center text-center gap-3 ${size === 'sm' ? '' : 'mb-2'}`}>
      <div className="relative">
        <div className={`rounded-full bg-linear-to-br from-brand to-brand-focus flex items-center justify-center text-white font-black shadow-md select-none ${size === 'sm' ? 'w-20 h-20 text-2xl' : 'w-24 h-24 text-3xl'}`}>
          {initials || <IconUser size={size === 'sm' ? 28 : 36} stroke={1.5} />}
        </div>
        <button className={`absolute bottom-0 right-0 rounded-full bg-brand-interaction text-white flex items-center justify-center shadow-sm hover:bg-brand-focus transition-colors ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'}`}>
          <IconPencil size={size === 'sm' ? 11 : 13} stroke={2.5} />
        </button>
      </div>
      <div>
        <p className={`font-bold text-anthracite leading-snug ${size === 'sm' ? 'text-base' : 'text-xl'}`}>
          {user ? `${user.firstName} ${user.lastName}` : '…'}
        </p>
        <p className="text-xs text-secondary mt-0.5">{user?.email ?? ''}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-interaction bg-blue-light px-2.5 py-0.5 rounded-full">
        <IconShieldCheck size={12} stroke={2.5} />
        {t('profil.certified_user')}
      </span>
    </div>
  );

  const InfoPersoSection = () => (
    <>
      <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary mb-2 px-1">{t('profil.info_section')}</h2>
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs divide-y divide-border">
        <InfoRow label={t('profil.fields.email')}    value={user?.email ?? '…'} />
        <InfoRow label={t('profil.fields.password')} value="••••••••••••"        onClick={() => openModal('password')} />
        <InfoRow label={t('profil.fields.phone')}    value={profile?.phoneNumber ?? '—'} onClick={() => openModal('phone')} />
        <InfoRow label={t('profil.fields.address')}  value={address ?? '—'}     onClick={() => openModal('address')} />
      </div>
    </>
  );

  return (
    <AppShell>

      <div className="md:hidden max-w-lg mx-auto px-4 pt-8 pb-10 flex flex-col gap-5">
        <AvatarBlock size="lg" />
        <section><InfoPersoSection /></section>
        <section>
          <IdentitySection
            profile={profile} user={user} dob={dob}
            isIdentityVerified={isIdentityVerified}
            onEdit={openModal}
          />
        </section>
        <section><JustificatifsSection documents={documents} onUpload={profile ? () => openModal('documents') : null} /></section>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-danger/30 text-danger font-semibold py-4 hover:bg-danger/5 transition-colors"
        >
          <IconLogout size={18} stroke={2} />
          {t('profil.logout')}
        </button>
      </div>

      <div
        className="hidden md:flex gap-6 px-6 py-8 max-w-7xl mx-auto w-full overflow-hidden"
        style={{ height: 'calc(100dvh - 65px)' }}
      >
        <aside className="w-80 shrink-0 bg-white rounded-2xl border border-border shadow-xs overflow-y-auto flex flex-col gap-6 p-6">
          <AvatarBlock size="sm" />
          <section>
            <IdentitySection
              profile={profile} user={user} dob={dob}
              isIdentityVerified={isIdentityVerified}
              onEdit={openModal}
            />
          </section>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-danger/30 text-danger text-sm font-semibold py-2.5 hover:bg-danger/5 transition-colors"
            >
              <IconLogout size={16} stroke={2} />
              {t('profil.logout')}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto flex flex-col gap-5">
          <section><InfoPersoSection /></section>
          <section><JustificatifsSection documents={documents} onUpload={profile ? () => openModal('documents') : null} /></section>
        </main>
      </div>

      <ProfilModal modal={modal} setModal={setModal} setField={setField} handleSave={handleSave} />

    </AppShell>
  );
}
