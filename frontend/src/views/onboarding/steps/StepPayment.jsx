import { useState } from 'react';
import Button from '@/components/ui/Button';
import { OnboardingHeader } from '../components';
import { PAYMENT_METHODS, OFFERS, getOffers } from '../data';

function formatPrice(price) { return price.toFixed(2).replace('.', ','); }
function PaymentIcon({ id }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>; }
function LockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }

export default function StepPayment({ profile, frequency, offerId, value, userData, onChange, onNext, onBack, progress }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const { recommended } = getOffers(profile, frequency);
  const offer = OFFERS[offerId] || recommended;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    const backendUrl = `${window.config?.BACKEND_URL}`;

    try {
      const userRes = await fetch(`${backendUrl}/api/add/user/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password
        })
      });
      const userResData = await userRes.json();
      
      if (!userRes.ok) {
        throw new Error(userResData.message || "Impossible de créer le compte.");
      }
      
      const compteId = userResData.user.insertId;

      const profilRes = await fetch(`${backendUrl}/api/profils`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compte_id: compteId,
          type_profil: "Porteur-Payeur",
          firstName: userData.firstName,
          lastName: userData.lastName,
          date_naissance: userData.date_naissance,
          phoneNumber: userData.phoneNumber || "",
          profession: profile,
        })
      });
      const profilData = await profilRes.json();
      const profilId = profilData.profil_id;

      const forfaitRes = await fetch(`${backendUrl}/api/forfaits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          porteur_id: profilId,
          payeur_id: profilId,
          type_forfait: offer.name
        })
      });
      const forfaitData = await forfaitRes.json();
      const forfaitId = forfaitData.forfait_id;

      for (const key in userData) {
        const file = userData[key];
        if (file instanceof File) {
          const formData = new FormData();
          formData.append("images", file);
          formData.append("profil_id", profilId);
          formData.append("type_document", key === 'identite' ? "Pièce d'identité" : "Justificatif TST"); 

          await fetch(`${backendUrl}/api/documents/upload`, {
            method: "POST",
            body: formData,
          });
        }
      }

      await fetch(`${backendUrl}/api/paiements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forfait_id: forfaitId,
          payeur_id: profilId,
          montant: offer.price,
          type_paiement: value === 'cb' ? 'Paiement direct' : 'Prélèvement automatique'
        })
      });

      onNext();

    } catch (err) {
      console.error("Erreur lors de la souscription :", err);
      setError(err.message || "Une erreur est survenue pendant la création du dossier.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} progress={progress} />
      <div className="flex-1 px-5 py-7 lg:px-8 lg:py-8 flex flex-col">
        <h1 className="text-2xl font-bold text-anthracite mb-1.5">Paiement sécurisé</h1>
        <p className="text-secondary text-sm mb-6">
          Choisissez votre moyen de paiement pour finaliser votre abonnement.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm font-medium flex gap-2">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

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
                <p className="font-semibold text-anthracite text-sm">{m.label}</p>
                <p className="text-secondary text-xs">{m.sub}</p>
              </div>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: value === m.id ? '#6485F6' : '#DDDDDD' }}>
                {value === m.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
            <span className="text-secondary font-medium">Total à payer</span>
            <span className="text-xl font-black text-anthracite">{formatPrice(offer.price)} €</span>
          </div>
          <Button variant="primary" full disabled={!value || processing} onClick={handlePay}>
            {processing ? (
              'Création du dossier en cours...'
            ) : (
              <><LockIcon /> Payer {formatPrice(offer.price)} €</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}