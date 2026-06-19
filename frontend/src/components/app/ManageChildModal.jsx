import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { STATUS_MAP } from '@/components/app/AppShell';
import { getChildOffers, PAYMENT_METHODS } from '@/views/onboarding/data';
import { apiFetch, toDateStr, formatDate } from '@/utils';

const PAYMENT_TYPE_MAP = {
  cb: 'Paiement direct',
  prelevement: 'Prélèvement automatique',
  autres: 'Paiement direct',
};

function calculateAge(birthDateStr) {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

export default function ManageChildModal({ open, onClose, child, onSubscribed }) {
  const [step, setStep] = useState('details');
  const [offerId, setOfferId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open || !child) return null;

  const age = child.birthDate ? calculateAge(toDateStr(child.birthDate)) : null;
  const { offers, recommended } = age != null ? getChildOffers(age) : { offers: [], recommended: null };
  const offer = offers.find((o) => o.id === offerId) || recommended;
  const sub = child.activeSubscription;
  const status = sub ? (STATUS_MAP[sub.statut] ?? { label: sub.statut, dot: 'bg-secondary/60' }) : null;

  const handleClose = () => {
    setStep('details');
    setOfferId(null);
    setPaymentMethod('cb');
    setError(null);
    onClose();
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const parent = JSON.parse(localStorage.getItem('user') || 'null');
      const parentInfo = await apiFetch(`/api/get/user/${parent.id}`);

      const { forfait_id } = await apiFetch('/api/forfaits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          porteur_id: child.profilId,
          payeur_id: parentInfo.profil_id,
          type_forfait: offer.name,
        }),
      });

      await apiFetch('/api/paiements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forfait_id,
          payeur_id: parentInfo.profil_id,
          montant: offer.price,
          type_paiement: PAYMENT_TYPE_MAP[paymentMethod] ?? 'Paiement direct',
        }),
      });

      onSubscribed(child);
    } catch {
      setError('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const TITLES = {
    details: `${child.firstName} ${child.lastName}`,
    forfait: 'Choisir son forfait',
    paiement: 'Paiement',
  };

  let footer;
  if (step === 'details') {
    footer = <Button variant="outline" onClick={handleClose}>Fermer</Button>;
  } else if (step === 'forfait') {
    footer = (
      <>
        <Button variant="outline" onClick={() => setStep('details')}>Retour</Button>
        <Button variant="primary" onClick={() => setStep('paiement')} disabled={!offer}>
          Continuer →
        </Button>
      </>
    );
  } else {
    footer = (
      <>
        <Button variant="outline" onClick={() => setStep('forfait')}>Retour</Button>
        <Button variant="primary" onClick={handlePay} disabled={loading || !offer}>
          {loading ? 'Paiement...' : `Payer ${offer ? formatPrice(offer.price) : '0,00'} €`}
        </Button>
      </>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={TITLES[step]} maxWidth="max-w-xl" footer={footer}>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm">
          {error}
        </div>
      )}

      {step === 'details' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-light text-brand-interaction flex items-center justify-center font-bold">
              {child.firstName?.[0]}{child.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-anthracite">{child.firstName} {child.lastName}</p>
              <p className="text-secondary text-sm">{child.email}</p>
            </div>
          </div>

          {sub ? (
            <div className="rounded-2xl bg-linear-to-br from-brand to-brand-focus text-white p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Forfait</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20">
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <h3 className="text-xl font-black leading-tight">{sub.type_forfait}</h3>
              {sub.date_debut && sub.date_fin && (
                <p className="text-sm text-white/80">
                  {formatDate(toDateStr(sub.date_debut))} – {formatDate(toDateStr(sub.date_fin))}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border bg-white p-6 flex flex-col items-center text-center gap-3">
              <p className="text-secondary text-sm">Aucun forfait actif pour {child.firstName}.</p>
              <Button variant="primary" onClick={() => setStep('forfait')}>Souscrire un forfait</Button>
            </div>
          )}
        </div>
      )}

      {step === 'forfait' && (
        <div className="flex flex-col gap-3">
          <p className="text-secondary text-sm mb-1">
            Forfaits éligibles pour {child.firstName} ({age} ans).
          </p>
          {offers.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOfferId(o.id)}
              className={`text-left rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                offer?.id === o.id ? 'border-brand shadow-md bg-blue-light' : 'border-border hover:border-secondary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-anthracite text-base">{o.name}</p>
                <span
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: offer?.id === o.id ? '#6485F6' : '#DDDDDD' }}
                >
                  {offer?.id === o.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </span>
              </div>
              <p className="text-secondary text-xs mb-2 leading-relaxed">{o.desc}</p>
              <p className="text-lg font-black text-anthracite">
                {o.priceLabel ?? `${formatPrice(o.price)} € / ${o.period}`}
              </p>
            </button>
          ))}
        </div>
      )}

      {step === 'paiement' && (
        <div className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPaymentMethod(m.id)}
              className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                paymentMethod === m.id ? 'border-brand bg-blue-light' : 'border-border hover:border-secondary/30'
              }`}
            >
              <div>
                <p className="font-semibold text-anthracite text-sm">{m.label}</p>
                <p className="text-secondary text-xs">{m.sub}</p>
              </div>
              <span
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: paymentMethod === m.id ? '#6485F6' : '#DDDDDD' }}
              >
                {paymentMethod === m.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          ))}

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
            <span className="text-secondary font-medium">Total</span>
            <span className="text-xl font-black text-anthracite">
              {offer.priceLabel ?? `${formatPrice(offer.price)} €`}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
