import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { PAYMENT_METHODS } from '@/views/onboarding/data';
import { apiFetch } from '@/utils';

const PAYMENT_TYPE_MAP = {
  cb: 'Paiement direct',
  prelevement: 'Prélèvement automatique',
  autres: 'Paiement direct',
};

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

export default function RenewModal({ open, onClose, sub, onRenewed }) {
  const [paymentMethod, setPaymentMethod] = useState('cb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open || !sub) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/forfaits/${sub.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant: sub.monthlyPrice,
          type_paiement: PAYMENT_TYPE_MAP[paymentMethod] ?? 'Paiement direct',
        }),
      });
      onRenewed();
    } catch {
      setError('Une erreur est survenue lors du renouvellement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Renouveler mon forfait"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading || !sub.monthlyPrice}>
            {loading ? 'Envoi...' : `Renouveler ${sub.monthlyPrice ? formatPrice(sub.monthlyPrice) + ' €' : ''}`}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm">
          {error}
        </div>
      )}

      <p className="text-secondary text-sm mb-4">
        Votre abonnement <span className="font-semibold text-anthracite">{sub.name}</span> sera soumis à nouveau pour validation par notre équipe.
      </p>

      {!sub.monthlyPrice && (
        <div className="mb-4 p-3 rounded-xl bg-warning-light border border-warning text-warning text-sm">
          Montant introuvable pour ce forfait, contactez le support pour le renouveler.
        </div>
      )}

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
      </div>
    </Modal>
  );
}
