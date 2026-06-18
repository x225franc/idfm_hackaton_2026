import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getChildOffers, PAYMENT_METHODS } from '@/views/onboarding/data';
import { apiFetch } from '@/utils';

const EMPTY_FORM = { firstName: '', lastName: '', birthDate: '', email: '' };
const STEPS = ['infos', 'forfait', 'paiement'];

const PAYMENT_TYPE_MAP = {
  cb: 'Paiement direct',
  prelevement: 'Prélèvement automatique',
  autres: 'Paiement direct',
};

const TITLES = {
  infos: 'Ajouter un proche',
  forfait: 'Choisir son forfait',
  paiement: 'Paiement',
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

export default function AddChildModal({ open, onClose, onCreated }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [birthDateError, setBirthDateError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [child, setChild] = useState(null);
  const [offerId, setOfferId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cb');

  const step = STEPS[stepIndex];
  const age = form.birthDate ? calculateAge(form.birthDate) : null;
  const { offers, recommended } = age != null ? getChildOffers(age) : { offers: [], recommended: null };
  const offer = offers.find((o) => o.id === offerId) || recommended;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
    if (field === 'birthDate') setBirthDateError(null);
  };

  const resetAll = () => {
    setStepIndex(0);
    setForm(EMPTY_FORM);
    setError(null);
    setBirthDateError(null);
    setChild(null);
    setOfferId(null);
    setPaymentMethod('cb');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Étape 1 : crée le compte du proche, puis passe au choix du forfait.
  const handleSubmitInfos = async (e) => {
    e.preventDefault();

    if (calculateAge(form.birthDate) >= 16) {
      setBirthDateError('Ce compte est réservé aux proches de moins de 16 ans.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/family/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setChild(data.child);
      setOfferId(null);
      setStepIndex(1);
    } catch (err) {
      setError(err.message === '409' ? 'Cette adresse e-mail est déjà utilisée.' : 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  // Étape 3 : crée le forfait (porté par le proche) et le paiement (réglé par le parent).
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

      onCreated(child);
      resetAll();
    } catch {
      setError('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Calculée via if/else (et non un objet littéral) pour n'évaluer que la branche active :
  // le rendu "paiement" lit offer.price, qui n'existe pas encore tant qu'on est à l'étape "infos".
  let footer;
  if (step === 'infos') {
    footer = (
      <>
        <Button variant="outline" onClick={handleClose}>Annuler</Button>
        <Button variant="primary" onClick={handleSubmitInfos} disabled={loading}>
          {loading ? 'Création...' : 'Continuer →'}
        </Button>
      </>
    );
  } else if (step === 'forfait') {
    footer = (
      <>
        <Button variant="outline" onClick={() => setStepIndex(0)}>Retour</Button>
        <Button variant="primary" onClick={() => setStepIndex(2)} disabled={!offer}>
          Continuer →
        </Button>
      </>
    );
  } else {
    footer = (
      <>
        <Button variant="outline" onClick={() => setStepIndex(1)}>Retour</Button>
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

      {step === 'infos' && (
        <form onSubmit={handleSubmitInfos} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" value={form.firstName} onChange={handleChange('firstName')} required />
            <Input label="Nom" value={form.lastName} onChange={handleChange('lastName')} required />
          </div>

          <Input
            label="Date de naissance"
            type="date"
            value={form.birthDate}
            onChange={handleChange('birthDate')}
            error={birthDateError}
            required
          />

          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required />

          <div className="bg-blue-info border border-[#BDD5F0] rounded-xl p-3.5 text-sm text-brand-interaction leading-relaxed">
            Un email sera envoyé avec les identifiants. Le paiement restera rattaché à votre compte.
          </div>
        </form>
      )}

      {step === 'forfait' && (
        <div className="flex flex-col gap-3">
          <p className="text-secondary text-sm mb-1">
            Forfaits éligibles pour {child?.firstName} ({age} ans).
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
