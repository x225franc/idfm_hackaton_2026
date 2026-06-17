import { useState, useEffect } from 'react';
import AppShell, { groupByMonth, spentThisMonth } from '@/components/app/AppShell';
import { apiFetch, toDateStr, formatDate, formatAmount } from '@/utils';
import {
  IconTrendingUp,
  IconCreditCard,
  IconBuildingBank,
  IconArrowsExchange,
  IconReceipt2,
} from '@tabler/icons-react';

const STATUS_CONFIG = {
  'Réussi':     { label: 'EFFECTUÉ',   className: 'text-success bg-[#EDFAF3]'    },
  'En attente': { label: 'EN ATTENTE', className: 'text-warning bg-warning-light' },
  'Échoué':     { label: 'ÉCHOUÉ',     className: 'text-danger bg-[#FFF0F0]'      },
};

const TYPE_ICONS = {
  'Prélèvement automatique': IconCreditCard,
  'Paiement direct':         IconBuildingBank,
  'Virement':                IconArrowsExchange,
};

function TransactionCard({ tx }) {
  const Icon     = TYPE_ICONS[tx.type] ?? IconReceipt2;
  const status   = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG['En attente'];
  const positive = tx.amount >= 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center shrink-0 text-brand-interaction">
        <Icon size={18} stroke={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-anthracite leading-snug">{tx.label}</p>
        <p className="text-xs text-secondary mt-0.5">{formatDate(tx.date, 'long')}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-sm font-black ${positive ? 'text-success' : 'text-anthracite'}`}>
          {formatAmount(tx.amount)}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-16 rounded-2xl bg-surface animate-pulse" />;
}

export default function Passes() {
  const [transactions, setTransactions] = useState(undefined); // undefined = chargement

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored?.id) { setTransactions([]); return; }

    apiFetch(`/api/get/user/${stored.id}`)
      .then((profile) => {
        if (!profile.profil_id) return [];
        return apiFetch(`/api/paiements/payeur/${profile.profil_id}`);
      })
      .then((paiements) => {
        setTransactions(
          paiements.map((p) => ({
            id:     p.id,
            type:   p.type_paiement,
            label:  p.type_forfait,
            date:   toDateStr(p.date_paiement),
            amount: -parseFloat(p.montant),
            status: p.statut_paiement,
          }))
        );
      })
      .catch((err) => {
        if (err.message === '404') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setTransactions([]);
      });
  }, []);

  const groups    = transactions ? groupByMonth(transactions) : [];
  const spent     = transactions ? spentThisMonth(transactions) : 0;
  const maxSpent  = Math.max(
    ...groups.map((g) =>
      g.items.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    ),
    1
  );
  const budgetPct = Math.min(100, (spent / maxSpent) * 100);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">

          <div className="md:sticky md:top-24">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm text-secondary font-medium">Total dépensé ce mois</p>
                <IconTrendingUp size={20} stroke={2} className="text-brand-interaction" />
              </div>
              <p className="text-3xl font-black text-anthracite mt-1 mb-3">
                {spent > 0 ? `${spent.toFixed(2).replace('.', ',')} €` : '0,00 €'}
              </p>
              <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {transactions === undefined ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <section key={group.label}>
                  <h2 className="text-base font-bold text-anthracite mb-3">{group.label}</h2>
                  <div className="flex flex-col gap-2">
                    {group.items.map((tx) => (
                      <TransactionCard key={tx.id} tx={tx} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <IconReceipt2 size={48} stroke={1.2} className="text-secondary/30" />
                <p className="text-secondary text-sm">Aucune transaction pour le moment.</p>
              </div>
            )}

            {groups.length > 0 && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <IconReceipt2 size={32} stroke={1.2} className="text/secondary/25" />
                <p className="text-secondary text-xs">
                  Vos transactions les plus récentes sont affichées en haut.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
