export function apiFetch(path, options = {}) {
  const base  = window.config?.BACKEND_URL ?? '';
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${base}${path}`, { ...options, headers }).then((r) => {
    if (r.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('401');
    }
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  });
}

export function toDateStr(val) {
  if (!val) return null;
  return String(val).slice(0, 10);
}

export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function formatDate(iso, format = 'short') {
  const [y, m, d] = iso.split('-');
  if (format === 'long') return `${d} ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
  return `${d}/${m}/${y}`;
}

export function formatAmount(amount) {
  const abs = Math.abs(amount).toFixed(2).replace('.', ',');
  return amount >= 0 ? `+${abs} €` : `${abs} €`;
}
