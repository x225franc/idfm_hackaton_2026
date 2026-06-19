import { useState, useEffect } from 'react';
import AppShell from '@/components/app/AppShell';
import { apiFetch, formatDate } from '@/utils';
import { IconMapPin, IconTrain, IconArrowRight } from '@tabler/icons-react';

const LINE_COLORS = {
  'RER A': '#E2231A',
  'RER B': '#6B73B5',
  'RER C': '#E5A020',
  'RER D': '#00814F',
  'RER E': '#C75BA6',
  'M1':  '#F0C514',
  'M2':  '#003E8A',
  'M3':  '#9B8134',
  'M4':  '#8B5CA4',
  'M5':  '#F08024',
  'M6':  '#6B8E46',
  'M7':  '#F0A0C8',
  'M8':  '#D5A0C8',
  'M9':  '#B5BB0A',
  'M10': '#D4A040',
  'M11': '#8B4010',
  'M12': '#007840',
  'M13': '#93C462',
  'M14': '#62259D',
};

function LineBadge({ ligne }) {
  const bg = LINE_COLORS[ligne] ?? '#64748b';
  return (
    <span
      className="inline-flex items-center justify-center text-white text-[11px] font-black rounded-full px-2 py-0.5 shrink-0"
      style={{ backgroundColor: bg, minWidth: '2.5rem' }}
    >
      {ligne}
    </span>
  );
}

function TrajetCard({ trajet }) {
  const date = new Date(trajet.date_scan);
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-blue-light flex items-center justify-center shrink-0 text-brand-interaction">
        <IconMapPin size={18} stroke={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-anthracite leading-snug">{trajet.station}</p>
        {trajet.direction && (
          <p className="text-xs text-secondary mt-0.5 flex items-center gap-1">
            <IconArrowRight size={11} stroke={2} />
            {trajet.direction}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <LineBadge ligne={trajet.ligne} />
        <span className="text-xs text-secondary">{time}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-16 rounded-2xl bg-surface animate-pulse" />;
}

function groupByDay(trajets) {
  const map = new Map();
  for (const t of trajets) {
    const d = new Date(t.date_scan);
    const key = d.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, { label: formatDate(key, 'long'), items: [] });
    map.get(key).items.push(t);
  }
  return [...map.values()];
}

export default function Trajets() {
  const [trajets, setTrajets] = useState(undefined);

  useEffect(() => {
    apiFetch('/api/trajets/me')
      .then(setTrajets)
      .catch(() => setTrajets([]));
  }, []);

  const groups = trajets ? groupByDay(trajets) : [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-anthracite">Mes trajets</h1>
          <p className="text-secondary text-sm mt-1">Historique de vos validations de pass.</p>
        </div>

        <div className="flex flex-col gap-6">
          {trajets === undefined ? (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.label}>
                <h2 className="text-base font-bold text-anthracite mb-3">{group.label}</h2>
                <div className="flex flex-col gap-2">
                  {group.items.map((t) => (
                    <TrajetCard key={t.id} trajet={t} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <IconTrain size={48} stroke={1.2} className="text-secondary/30" />
              <p className="text-secondary text-sm">Aucun trajet enregistré pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
