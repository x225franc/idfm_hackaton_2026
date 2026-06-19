import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MONTH_NAMES } from '@/utils';
import {
  IconLayoutDashboard,
  IconReceipt2,
  IconTrain,
  IconMessageChatbot,
  IconUser,
} from '@tabler/icons-react';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Tableau',    icon: IconLayoutDashboard },
  { to: '/historique', label: 'Historique', icon: IconReceipt2        },
  { to: '/trajets',    label: 'Trajets',    icon: IconTrain            },
  { to: '/ask',        label: 'Ask',        icon: IconMessageChatbot   },
  { to: '/profil',     label: 'Profil',     icon: IconUser             },
];

export const STATUS_MAP = {
  'Actif':                    { label: 'Actif',         dot: 'bg-success'     },
  'Suspendu':                 { label: 'Suspendu',      dot: 'bg-warning'     },
  'A renouveler':             { label: 'À renouveler',  dot: 'bg-warning'     },
  'En attente de validation': { label: 'En attente',    dot: 'bg-secondary/60'},
};

export function subscriptionProgress(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.min(100, Math.max(0, ((Date.now() - s) / (e - s)) * 100));
}

export function groupByMonth(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const [y, m] = tx.date.split('-');
    const key = `${y}-${m}`;
    if (!map.has(key)) {
      map.set(key, { label: `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`, items: [] });
    }
    map.get(key).items.push(tx);
  }
  return [...map.values()];
}

export function spentThisMonth(transactions) {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return transactions
    .filter((tx) => {
      const [ty, tm] = tx.date.split('-');
      return ty === y && tm === m && tx.amount < 0;
    })
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
}

export default function AppShell({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-10">
        <div className="flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? 'text-brand' : 'text-secondary hover:text-anthracite'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${active ? 'bg-blue-light' : ''}`}>
                  <Icon size={20} stroke={active ? 2.5 : 1.8} />
                </div>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
