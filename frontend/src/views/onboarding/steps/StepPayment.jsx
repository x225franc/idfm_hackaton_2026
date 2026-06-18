import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { PAYMENT_METHODS, OFFERS, getOffers, getDocuments } from '../data';

const PAYMENT_TYPE_MAP = {
  cb:          'Paiement direct',
  prelevement: 'Prélèvement automatique',
  autres:      'Paiement direct',
};

const DOC_TYPE_MAP = {
  identite:      "Pièce d'identité",
  scolarite:     'Certificat de scolarité',
  bourse:        'Attestation de bourse',
  'aide-sociale':'Justificatif d\'aide sociale',
  photo:         "Photo d'identité",
};

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function PaymentIcon({ id }) {
  if (id === 'cb') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (id === 'prelevement') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M5 21V9l7-5 7 5v12" /><path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function StepPayment({ profile, frequency, offerId, value, userData, onChange, onNext, onBack, onLogoClick, progress }) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { recommended } = getOffers(profile, frequency);
  const offer = OFFERS[offerId] || recommended;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    try {
      const base  = window.config?.BACKEND_URL ?? '';
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const isLoggedIn = !!token && !!storedUser;

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const post = async (path, body) => {
        const res = await fetch(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw Object.assign(new Error(String(res.status)), { status: res.status });
        return res.json();
      };

      const get = async (path) => {
        const res = await fetch(`${base}${path}`, { headers });
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      };

      let compte_id;
      let profil_id;

      if (isLoggedIn) {
        compte_id = storedUser.id;
        const userInfo = await get(`/api/get/user/${compte_id}`);
        profil_id = userInfo.profil_id ?? null;
      } else {
        const { user } = await post('/api/add/user/onboarding', {
          firstName: userData.firstName,
          lastName:  userData.lastName,
          email:     userData.email,
          password:  userData.password,
        });
        compte_id = user.insertId;
        await post('/api/send-verification-email', { email: userData.email });
      }

      if (!profil_id) {
        const { profil_id: newId } = await post('/api/profils', {
          compte_id,
          type_profil:    'Porteur-Payeur',
          firstName:      userData.firstName,
          lastName:       userData.lastName,
          date_naissance: userData.date_naissance,
          phoneNumber:    userData.phoneNumber || null,
        });
        profil_id = newId;
      }

      const docDefs = getDocuments(profile);
      await Promise.all(
        docDefs
          .filter((d) => userData[d.id] instanceof File)
          .map((d) => {
            const fd = new FormData();
            fd.append('profil_id', profil_id);
            fd.append('type_document', DOC_TYPE_MAP[d.id] ?? d.label);
            fd.append('images', userData[d.id]);
            return fetch(`${base}/api/documents/upload`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          })
      );

      const { forfait_id } = await post('/api/forfaits', {
        porteur_id:   profil_id,
        payeur_id:    profil_id,
        type_forfait: offer.name,
      });

      await post('/api/paiements', {
        forfait_id,
        payeur_id:     profil_id,
        montant:       offer.price,
        type_paiement: PAYMENT_TYPE_MAP[value] ?? 'Paiement direct',
      });

      onNext();
    } catch (err) {
      setError(
        err.status === 409
          ? 'Cette adresse e-mail est déjà utilisée.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} onLogoClick={onLogoClick} progress={progress} />
      <div className="flex-1 w-full max-w-xl mx-auto px-5 py-7 lg:px-8 lg:py-10 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">{t('payment.title')}</h1>
        <p className="text-secondary text-sm mb-6">{t('payment.subtitle')}</p>

        <div className="flex flex-col gap-3 mb-6">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                value === m.id ? 'border-brand bg-blue-light' : 'border-border hover:border-secondary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${value === m.id ? 'bg-brand text-white' : 'bg-surface text-secondary'}`}>
                <PaymentIcon id={m.id} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-anthracite text-sm">
                  {t(`payment.methods.${m.id}.label`, { defaultValue: m.label })}
                </p>
                <p className="text-secondary text-xs">
                  {t(`payment.methods.${m.id}.sub`, { defaultValue: m.sub })}
                </p>
              </div>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: value === m.id ? '#6485F6' : '#DDDDDD' }}>
                {value === m.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#FFF0F0] border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
            <span className="text-secondary font-medium">{t('payment.total')}</span>
            <span className="text-xl font-black text-anthracite">
              {offer.priceLabel ? t(`offer.offers.${offer.id}.priceLabel`, { defaultValue: offer.priceLabel }) : `${formatPrice(offer.price)} €`}
            </span>
          </div>
          <Button variant="primary" full disabled={!value || processing} onClick={handlePay}>
            {processing ? t('payment.processing') : (
              <>
                <LockIcon />{' '}
                {offer.priceLabel
                  ? t(`offer.offers.${offer.id}.priceLabel`, { defaultValue: offer.priceLabel })
                  : t('payment.pay', { amount: formatPrice(offer.price) })}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
