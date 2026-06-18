import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell, { STATUS_MAP, subscriptionProgress } from '@/components/app/AppShell';
import Button from '@/components/ui/Button';
import { apiFetch, toDateStr, formatDate } from '@/utils';

function nextDebitDateLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 5);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  return formatDate(`${y}-${m}-05`, 'long');
}
import {
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconRefresh,
  IconHeadset,
  IconInfoCircle,
  IconChevronRight,
  IconTicket,
} from '@tabler/icons-react';

function CardSkeleton() {
  return <div className="rounded-2xl bg-surface h-52 animate-pulse" />;
}

function SubscriptionCard({ sub }) {
  const status   = STATUS_MAP[sub.status] ?? { label: sub.status, dot: 'bg-secondary/60' };
  const progress = sub.startDate && sub.endDate
    ? subscriptionProgress(sub.startDate, sub.endDate)
    : 0;

  return (
    <>
      <div className="rounded-2xl bg-linear-to-br from-brand to-brand-focus text-white p-5 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
            Forfait actuel
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20">
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <h2 className="text-2xl font-black leading-tight">{sub.name}</h2>

        {sub.startDate && sub.endDate && (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <IconCalendar size={15} stroke={2} />
            <span>{formatDate(sub.startDate)} – {formatDate(sub.endDate)}</span>
          </div>
        )}

        {sub.startDate && sub.endDate && (
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {sub.monthlyPrice && (
        <div className="bg-blue-info border border-[#BDD5F0] rounded-2xl p-4 flex gap-3">
          <IconInfoCircle size={20} stroke={2} className="text-brand-interaction shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-anthracite">Rappel de prélèvement</p>
            <p className="text-xs text-secondary mt-0.5 leading-relaxed">
              Votre prochain prélèvement de{' '}
              <span className="font-semibold text-anthracite">
                {sub.monthlyPrice.toFixed(2).replace('.', ',')} €
              </span>{' '}
              interviendra le {nextDebitDateLabel()}.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function PendingSubscription({ sub }) {
  return (
    <div className="rounded-2xl border-2 border-warning/30 bg-warning-light p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-warning/15 flex items-center justify-center text-warning">
          <IconClock size={26} stroke={1.5} />
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-warning/15 text-warning">
          <span className="w-2 h-2 rounded-full bg-warning" />
          En attente
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-warning/60 mb-1">Forfait demandé</p>
        <p className="text-xl font-black text-anthracite">{sub.name}</p>
      </div>
      <p className="text-sm text-secondary leading-relaxed">
        Votre demande est en cours de traitement. Notre équipe validera votre abonnement dans les prochains jours.
      </p>
      <div className="h-px bg-warning/20" />
      <p className="text-xs text-secondary">
        Vous serez notifié par e-mail dès que votre forfait sera activé.
      </p>
    </div>
  );
}

function EmptySubscription() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-white p-8 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-light flex items-center justify-center text-brand-interaction">
        <IconTicket size={28} stroke={1.5} />
      </div>
      <div>
        <p className="font-bold text-anthracite text-base">Aucun forfait actif</p>
        <p className="text-secondary text-sm mt-1 leading-relaxed max-w-xs">
          Souscrivez à un abonnement pour commencer à utiliser Comutitres.
        </p>
      </div>
      <Link to="/" state={{ startStep: 1 }}>
        <Button variant="primary">Choisir un forfait</Button>
      </Link>
    </div>
  );
}

export default function Tableau() {
  const [user, setUser]   = useState(null);
  const [sub,  setSub]    = useState(undefined); // undefined = chargement, null = aucun forfait

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(stored);
    if (!stored?.id) { setSub(null); return; }

    (async () => {
      try {
        const profile = await apiFetch(`/api/get/user/${stored.id}`);
        if (!profile.profil_id) { setSub(null); return; }

        const [forfaits, paiements] = await Promise.all([
          apiFetch(`/api/forfaits/porteur/${profile.profil_id}`),
          apiFetch(`/api/paiements/payeur/${profile.profil_id}`),
        ]);

        const forfait = forfaits.find((f) => f.statut === 'Actif')
          ?? forfaits.find((f) => f.statut === 'En attente de validation')
          ?? forfaits[0]
          ?? null;

        setSub(forfait ? {
          name:         forfait.type_forfait,
          status:       forfait.statut,
          startDate:    toDateStr(forfait.date_debut),
          endDate:      toDateStr(forfait.date_fin),
          monthlyPrice: paiements[0] ? parseFloat(paiements[0].montant) : null,
        } : null);
      } catch (err) {
        if (err.message === '404') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setSub(null);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-anthracite">
            Bonjour, {user?.firstName ?? '…'}&nbsp;👋
          </h1>
          <p className="text-secondary text-sm mt-1">Ravi de vous revoir sur votre espace.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 items-start">
          <div className="flex flex-col gap-4">
            {sub === undefined
              ? <CardSkeleton />
              : sub?.status === 'En attente de validation'
                ? <PendingSubscription sub={sub} />
                : sub
                  ? <SubscriptionCard sub={sub} />
                  : <EmptySubscription />
            }
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-anthracite">Actions rapides</h2>

            {sub && sub.status === 'Actif' && (
              <Link
                to="/documents"
                className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-brand/40 hover:shadow-sm transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center shrink-0 text-brand-interaction">
                  <IconFileDescription size={20} stroke={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-anthracite text-sm">Mes documents</p>
                  <p className="text-secondary text-xs">Attestations, reçus...</p>
                </div>
                <IconChevronRight size={18} stroke={2} className="text-secondary shrink-0" />
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3">
              {sub && sub.status === 'Actif' && (
                <Link
                  to="/changer-forfait"
                  className="bg-white rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-brand/40 hover:shadow-sm transition-all shadow-xs text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center text-brand-interaction">
                    <IconRefresh size={20} stroke={2} />
                  </div>
                  <p className="font-semibold text-anthracite text-xs leading-snug">
                    Changer de forfait
                  </p>
                </Link>
              )}

              <Link
                to="/support"
                className={`bg-white rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-brand/40 hover:shadow-sm transition-all shadow-xs text-center ${(!sub || sub.status !== 'Actif') ? 'col-span-2' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center text-brand-interaction">
                  <IconHeadset size={20} stroke={2} />
                </div>
                <p className="font-semibold text-anthracite text-xs leading-snug">
                  Contacter le support
                </p>
              </Link>
            </div>

            {sub && (
              <div className="hidden md:block mt-2">
                <Link to="/passes">
                  <Button variant="outline" full>Voir mes transactions</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
