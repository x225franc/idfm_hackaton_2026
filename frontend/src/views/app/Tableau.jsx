import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppShell, { STATUS_MAP, subscriptionProgress } from '@/components/app/AppShell';
import AddChildModal from '@/components/app/AddChildModal';
import Button from '@/components/ui/Button';
import { apiFetch, toDateStr, formatDate } from '@/utils';
import {
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconRefresh,
  IconHeadset,
  IconInfoCircle,
  IconChevronRight,
  IconTicket,
  IconPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

function nextDebitDateLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 5);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  return formatDate(`${y}-${m}-05`, 'long');
}

function CardSkeleton() {
  return <div className="rounded-2xl bg-surface h-52 animate-pulse" />;
}

function Notice({ notice, onClose }) {
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 bg-white ${isError ? 'border-danger' : 'border-success'}`}>
      <div className={`mt-0.5 ${isError ? 'text-danger' : 'text-success'}`}>{isError ? <IconX size={18} /> : <IconCheck size={18} />}</div>
      <p className="text-sm text-anthracite flex-1">{notice.message}</p>
      <button onClick={onClose} className="text-secondary hover:text-anthracite"><IconX size={14} /></button>
    </div>
  );
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

function ChildCard({ child, onManage }) {
  return (
    <div className="shrink-0 w-48 bg-white rounded-2xl border border-border p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-light text-brand-interaction flex items-center justify-center font-bold text-sm">
        {child.firstName?.[0]}{child.lastName?.[0]}
      </div>
      <div>
        <p className="font-semibold text-anthracite text-sm truncate">{child.firstName} {child.lastName}</p>
        <p className="text-secondary text-xs mt-0.5">
          {child.activeSubscription ? child.activeSubscription.type_forfait : 'Aucun abonnement actif'}
        </p>
      </div>
      <Button variant="outline" className="text-xs py-2" onClick={() => onManage(child)}>Gérer</Button>
    </div>
  );
}

function FamilySection({ children, loading, onAdd, onManage }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-anthracite">Mes proches</h2>
        <button
          onClick={onAdd}
          aria-label="Ajouter un proche"
          className="w-8 h-8 rounded-full bg-blue-light text-brand-interaction flex items-center justify-center hover:bg-blue-light/70 transition-colors"
        >
          <IconPlus size={18} stroke={2.5} />
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-surface h-28 animate-pulse" />
      ) : children.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-white p-6 flex flex-col items-center text-center gap-3">
          <span className="text-3xl">👨‍👧</span>
          <p className="text-secondary text-sm">Ajoutez le compte d'un proche mineur pour gérer son abonnement.</p>
          <Button variant="primary" onClick={onAdd}>Ajouter un proche</Button>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} onManage={onManage} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Tableau() {
  const location = useLocation();
  const [user, setUser]   = useState(null);
  const [sub,  setSub]    = useState(undefined); // undefined = chargement, null = aucun forfait

  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      setChildren(await apiFetch('/api/family/children'));
    } catch {
      setChildren([]);
    } finally {
      setLoadingChildren(false);
    }
  };

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

    // Un compte mineur ne gère pas de proches : seuls les comptes normaux (parents) en ont.
    if (!stored?.is_minor) fetchChildren();
    else setLoadingChildren(false);
  }, []);

  // Arrivée depuis l'interstitiel "Junior < 16 ans" de l'onboarding : ouvre directement la modale.
  // (jamais pour un compte mineur lui-même, qui ne peut pas ajouter de proche)
  useEffect(() => {
    if (location.state?.openAddChild && !user?.is_minor) setAddChildOpen(true);
  }, [location.state, user]);

  const handleChildCreated = (child) => {
    setAddChildOpen(false);
    showNotice('success', `✓ Le compte de ${child.firstName} a été créé. Identifiants envoyés par email.`);
    fetchChildren();
  };

  const handleManageChild = () => {
    showNotice('success', 'La gestion détaillée du compte d\'un proche arrive prochainement.');
  };

  return (
    <AppShell>
      <Notice notice={notice} onClose={() => setNotice(null)} />

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

          {/* Un proche mineur connecté est en lecture seule : pas de gestion de famille pour lui. */}
          {!user?.is_minor && (
            <FamilySection
              children={children}
              loading={loadingChildren}
              onAdd={() => setAddChildOpen(true)}
              onManage={handleManageChild}
            />
          )}

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

      <AddChildModal
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        onCreated={handleChildCreated}
      />
    </AppShell>
  );
}
