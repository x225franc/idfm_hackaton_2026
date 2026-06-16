import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

const API_BASE = window.config?.BACKEND_URL || '';

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actifs' },
  { value: 'banned', label: 'Bannis' },
];

// Types de forfait disponibles (cf. database/idfm_hackaton.sql, enum `type_forfait`)
const FORFAIT_OPTIONS = [
  'Navigo Annuel',
  'Imagine R Etudiant',
  'Imagine R Junior',
  'Imagine R Scolaire',
  'Liberté+',
  'TST',
  'Améthyste',
].map((v) => ({ value: v, label: v }));

// Statuts possibles d'un abonnement (cf. database/idfm_hackaton.sql, enum `statut`)
const SUB_STATUS_OPTIONS = [
  'Actif',
  'Suspendu',
  'A renouveler',
  'En attente de validation',
].map((v) => ({ value: v, label: v }));

const PAGE_SIZE = 10;

/* ────────────────────────── Icônes ────────────────────────── */

function Icon({ children, ...props }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}
const PlusIcon = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const EditIcon = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></Icon>;
const TrashIcon = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Icon>;
const BanIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></Icon>;
const CheckCircleIcon = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const TicketIcon = (p) => <Icon {...p}><path d="M3 9a3 3 0 1 0 0 6h.5a1.5 1.5 0 0 1 0 0H3" /><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M13 6v12" strokeDasharray="2 2" /></Icon>;
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
const ChevronLeftIcon = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6" /></Icon>;
const ChevronRightIcon = (p) => <Icon {...p}><path d="M9 18l6-6-6-6" /></Icon>;
const XIcon = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;

/* ────────────────────────── Badges ────────────────────────── */

function StatusBadge({ banned }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
      banned ? 'bg-danger-light/20 text-danger' : 'bg-[#EDFAF3] text-success'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${banned ? 'bg-danger' : 'bg-success'}`} />
      {banned ? 'Banni' : 'Actif'}
    </span>
  );
}

const SUB_STATUS_STYLES = {
  Actif: 'bg-[#EDFAF3] text-success',
  Suspendu: 'bg-danger-light/20 text-danger',
  'A renouveler': 'bg-warning-light text-warning',
  'En attente de validation': 'bg-blue-info text-brand-interaction',
};

function SubStatusBadge({ statut }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${SUB_STATUS_STYLES[statut] || 'bg-surface text-secondary'}`}>
      {statut}
    </span>
  );
}

/* ────────────────────────── Notice (toast simple) ────────────────────────── */

function Notice({ notice, onClose }) {
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-sm rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${
      isError ? 'bg-white border-danger' : 'bg-white border-success'
    }`}>
      <div className={`mt-0.5 ${isError ? 'text-danger' : 'text-success'}`}>
        {isError ? <XIcon /> : <CheckCircleIcon />}
      </div>
      <p className="text-sm text-anthracite flex-1">{notice.message}</p>
      <button onClick={onClose} aria-label="Fermer" className="text-secondary hover:text-anthracite">
        <XIcon width={14} height={14} />
      </button>
    </div>
  );
}

/* ────────────────────────── Page principale ────────────────────────── */

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  // Abonnements gérés côté front uniquement pour l'instant (pas encore d'API dédiée).
  // TODO: brancher sur une vraie API /api/get/abonnements/user/:id, /api/add/abonnement, /api/delete/abonnement/:id
  const [subscriptionsByUser, setSubscriptionsByUser] = useState({});

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [subsUser, setSubsUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  /* ── Chargement de la liste ── */
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (search.trim()) params.set('q', search.trim());
      if (role) params.set('role', role);
      if (status) params.set('status', status);

      const res = await fetch(`${API_BASE}/api/get/user/admin?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce de la recherche + rechargement sur changement de filtre/page
  useEffect(() => {
    const timer = setTimeout(fetchUsers, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status, page]);

  // Revenir en page 1 quand un filtre change
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  /* ── Actions ── */

  const handleBanToggle = async (user) => {
    const endpoint = user.isBanned ? 'unban' : 'ban';
    try {
      const res = await fetch(`${API_BASE}/api/${endpoint}/user/${user.id}`, { method: 'PUT' });
      if (!res.ok) throw new Error();
      showNotice('success', user.isBanned ? 'Utilisateur rétabli.' : 'Utilisateur banni.');
      fetchUsers();
    } catch {
      showNotice('error', "Échec de l'opération.");
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      showNotice('success', 'Rôle mis à jour.');
      fetchUsers();
    } catch {
      showNotice('error', 'Échec de la mise à jour du rôle.');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      // NOTE: la route DELETE /api/delete/user/:id est actuellement commentée côté backend.
      const res = await fetch(`${API_BASE}/api/delete/user/${deletingUser.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showNotice('success', 'Utilisateur supprimé.');
      setDeletingUser(null);
      fetchUsers();
    } catch {
      showNotice('error', "Suppression impossible : la route backend n'est pas encore activée.");
      setDeletingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Notice notice={notice} onClose={() => setNotice(null)} />

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary bg-surface px-2.5 py-1 rounded-full">
              Backoffice
            </span>
          </div>
          <Link to="/" className="text-sm font-medium text-secondary hover:text-brand-interaction transition-colors">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ── Titre + action principale ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-anthracite mb-1">Utilisateurs</h1>
              <p className="text-secondary text-sm">
                {total} utilisateur{total > 1 ? 's' : ''} au total
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <PlusIcon /> Ajouter un utilisateur
            </Button>
          </div>

          {/* ── Filtres ── */}
          <div className="bg-white rounded-2xl border border-border p-4 mb-6 grid sm:grid-cols-3 gap-3">
            <Input
              placeholder="Rechercher (nom, email, pseudo...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              rightElement={<SearchIcon />}
            />
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Tous les rôles"
              options={ROLE_OPTIONS}
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Tous les statuts"
              options={STATUS_OPTIONS}
            />
          </div>

          {/* ── Tableau ── */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {error && (
              <div className="px-5 py-4 bg-danger-light/10 text-danger text-sm border-b border-border">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-secondary">
                    <th className="px-5 py-3 font-semibold">Utilisateur</th>
                    <th className="px-5 py-3 font-semibold">Rôle</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                    <th className="px-5 py-3 font-semibold">Abonnements</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-secondary">
                        Chargement…
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-secondary">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const subs = subscriptionsByUser[u.id] || [];
                      return (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-page/60 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-info text-brand-interaction flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                {u.profilePicture ? (
                                  <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  `${(u.firstName || '?')[0]}${(u.lastName || '')[0] || ''}`.toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-anthracite truncate">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-secondary text-xs truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className="text-xs font-semibold rounded-lg border border-border bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                              {ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3"><StatusBadge banned={!!u.isBanned} /></td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {subs.length === 0 ? (
                                <span className="text-xs text-secondary italic">Aucun</span>
                              ) : (
                                subs.slice(0, 2).map((s) => (
                                  <span key={s.id} className="text-[11px] font-medium bg-surface text-anthracite px-2 py-0.5 rounded-full">
                                    {s.type_forfait}
                                  </span>
                                ))
                              )}
                              {subs.length > 2 && (
                                <span className="text-[11px] font-medium text-secondary px-1.5 py-0.5">
                                  +{subs.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                title="Gérer les abonnements"
                                onClick={() => setSubsUser(u)}
                                className="p-2 rounded-lg text-brand-interaction hover:bg-blue-light transition-colors"
                              >
                                <TicketIcon />
                              </button>
                              <button
                                title="Modifier"
                                onClick={() => setEditingUser(u)}
                                className="p-2 rounded-lg text-secondary hover:bg-surface hover:text-anthracite transition-colors"
                              >
                                <EditIcon />
                              </button>
                              <button
                                title={u.isBanned ? 'Rétablir' : 'Bannir'}
                                onClick={() => handleBanToggle(u)}
                                className={`p-2 rounded-lg transition-colors ${
                                  u.isBanned ? 'text-success hover:bg-[#EDFAF3]' : 'text-warning hover:bg-warning-light'
                                }`}
                              >
                                {u.isBanned ? <CheckCircleIcon /> : <BanIcon />}
                              </button>
                              <button
                                title="Supprimer"
                                onClick={() => setDeletingUser(u)}
                                className="p-2 rounded-lg text-danger hover:bg-danger-light/20 transition-colors"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-secondary">
                Page {page + 1} / {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 rounded-lg border border-border text-anthracite disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  className="p-2 rounded-lg border border-border text-anthracite disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modale : ajout utilisateur ── */}
      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          setShowAddModal(false);
          showNotice('success', 'Utilisateur créé avec succès.');
          fetchUsers();
        }}
        onError={(msg) => showNotice('error', msg)}
      />

      {/* ── Modale : édition utilisateur ── */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => {
          setEditingUser(null);
          showNotice('success', 'Utilisateur mis à jour.');
          fetchUsers();
        }}
        onError={(msg) => showNotice('error', msg)}
      />

      {/* ── Modale : gestion des abonnements ── */}
      <SubscriptionsModal
        user={subsUser}
        subscriptions={subsUser ? subscriptionsByUser[subsUser.id] || [] : []}
        onClose={() => setSubsUser(null)}
        onAdd={(sub) => {
          setSubscriptionsByUser((prev) => ({
            ...prev,
            [subsUser.id]: [...(prev[subsUser.id] || []), sub],
          }));
          showNotice('success', 'Abonnement ajouté.');
        }}
        onRemove={(subId) => {
          setSubscriptionsByUser((prev) => ({
            ...prev,
            [subsUser.id]: (prev[subsUser.id] || []).filter((s) => s.id !== subId),
          }));
          showNotice('success', 'Abonnement supprimé.');
        }}
      />

      {/* ── Modale : confirmation suppression ── */}
      <Modal
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Supprimer l'utilisateur"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </>
        }
      >
        <p className="text-secondary text-sm">
          Êtes-vous sûr de vouloir supprimer{' '}
          <span className="font-semibold text-anthracite">
            {deletingUser?.firstName} {deletingUser?.lastName}
          </span>{' '}
          ? Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}

/* ────────────────────────── Modale : ajout utilisateur ────────────────────────── */

function AddUserModal({ open, onClose, onCreated, onError }) {
  const emptyForm = { username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '' };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/add/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la création');
      }
      onCreated();
    } catch (err) {
      onError(err.message || 'Erreur lors de la création de l\'utilisateur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un utilisateur">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Nom" name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <Input label="Pseudo" name="username" value={form.username} onChange={handleChange} required />
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <Input label="Téléphone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <Input label="Mot de passe" type="password" name="password" value={form.password} onChange={handleChange} required />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Création…' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ────────────────────────── Modale : édition utilisateur ────────────────────────── */

function EditUserModal({ user, onClose, onSaved, onError }) {
  const [form, setForm] = useState({ phoneNumber: '', address: '', postalCode: '', city: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        postalCode: user.postalCode || '',
        city: user.city || '',
        password: '',
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/update/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      onSaved();
    } catch (err) {
      onError(err.message || "Erreur lors de la mise à jour de l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Modifier ${user.firstName} ${user.lastName}`}>
      {/* Le pseudo/nom/email ne sont pas modifiables : l'API /api/update/user ne gère pas ces champs */}
      <div className="bg-page rounded-xl px-4 py-3 mb-4 text-sm text-secondary flex items-center justify-between flex-wrap gap-1">
        <span>{user.username}</span>
        <span>{user.email}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Téléphone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        <Input label="Adresse" name="address" value={form.address} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Code postal" name="postalCode" value={form.postalCode} onChange={handleChange} />
          <Input label="Ville" name="city" value={form.city} onChange={handleChange} />
        </div>
        <Input
          label="Nouveau mot de passe"
          type="password"
          name="password"
          placeholder="Laisser vide pour ne pas changer"
          value={form.password}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ────────────────────────── Modale : gestion des abonnements ────────────────────────── */

function SubscriptionsModal({ user, subscriptions, onClose, onAdd, onRemove }) {
  const emptyForm = { type_forfait: '', statut: 'En attente de validation', date_debut: '', date_fin: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user) setForm(emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.type_forfait) return;
    onAdd({ id: crypto.randomUUID(), ...form });
    setForm(emptyForm);
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Abonnements · ${user.firstName} ${user.lastName}`} maxWidth="max-w-xl">
      {/* TODO: ces abonnements sont gérés en local (mock) en attendant une API dédiée côté backend */}
      <div className="flex flex-col gap-2 mb-6">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-secondary italic">Aucun abonnement pour cet utilisateur.</p>
        ) : (
          subscriptions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 border border-border rounded-xl px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-anthracite text-sm truncate">{s.type_forfait}</p>
                  <SubStatusBadge statut={s.statut} />
                </div>
                {(s.date_debut || s.date_fin) && (
                  <p className="text-xs text-secondary">
                    {s.date_debut || '—'} → {s.date_fin || '—'}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemove(s.id)}
                title="Supprimer l'abonnement"
                className="p-2 rounded-lg text-danger hover:bg-danger-light/20 transition-colors shrink-0"
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-[11px] font-semibold text-anthracite uppercase tracking-widest mb-3">
          Ajouter un abonnement
        </p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <Select
            placeholder="Choisir un forfait"
            name="type_forfait"
            value={form.type_forfait}
            onChange={handleChange}
            options={FORFAIT_OPTIONS}
            required
          />
          <Select
            label="Statut"
            name="statut"
            value={form.statut}
            onChange={handleChange}
            options={SUB_STATUS_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date début" type="date" name="date_debut" value={form.date_debut} onChange={handleChange} />
            <Input label="Date fin" type="date" name="date_fin" value={form.date_fin} onChange={handleChange} />
          </div>
          <Button variant="primary" type="submit" full className="mt-1">
            <PlusIcon /> Ajouter l'abonnement
          </Button>
        </form>
      </div>
    </Modal>
  );
}
