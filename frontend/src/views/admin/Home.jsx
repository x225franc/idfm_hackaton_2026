import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

const API_BASE = window.config?.BACKEND_URL || 'http://localhost:3002'; // Pense à bien pointer sur ton port backend

const ROLE_OPTIONS = [
  { value: 'user', label: 'Client' }, // Aligné avec ton Enum BDD ('user', 'admin')
  { value: 'admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actifs' },
  { value: 'banned', label: 'Bannis' },
];

const SUB_STATUS_OPTIONS = [
  'Actif',
  'Suspendu',
  'A renouveler',
  'En attente de validation',
].map((v) => ({ value: v, label: v }));

const PAGE_SIZE = 10;

/* ────────────────────────── Icônes ────────────────────────── */
function Icon({ children, ...props }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
}
const PlusIcon = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const EditIcon = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></Icon>;
const TrashIcon = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Icon>;
const BanIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></Icon>;
const CheckCircleIcon = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
const EyeIcon = (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>;
const XIcon = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;

/* ────────────────────────── Badges ────────────────────────── */
function StatusBadge({ banned }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${banned ? 'bg-danger-light/20 text-danger' : 'bg-[#EDFAF3] text-success'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${banned ? 'bg-danger' : 'bg-success'}`} />
      {banned ? 'Banni' : 'Actif'}
    </span>
  );
}

const SUB_STATUS_STYLES = {
  'Actif': 'bg-[#EDFAF3] text-success',
  'Suspendu': 'bg-danger-light/20 text-danger',
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

/* ────────────────────────── Notice ────────────────────────── */
function Notice({ notice, onClose }) {
  if (!notice) return null;
  const isError = notice.type === 'error';
  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-sm rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${isError ? 'bg-white border-danger' : 'bg-white border-success'}`}>
      <div className={`mt-0.5 ${isError ? 'text-danger' : 'text-success'}`}>{isError ? <XIcon /> : <CheckCircleIcon />}</div>
      <p className="text-sm text-anthracite flex-1">{notice.message}</p>
      <button onClick={onClose} className="text-secondary hover:text-anthracite"><XIcon width={14} height={14} /></button>
    </div>
  );
}

/* ────────────────────────── Page principale SPA ────────────────────────── */
export default function Admin() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'documents', 'forfaits'
  const [notice, setNotice] = useState(null);

  // States Users
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // States Documents & Forfaits
  const [documents, setDocuments] = useState([]);
  const [forfaits, setForfaits] = useState([]);

  // Modales & Filtres Users
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  /* ── Fetchers ── */
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ limit: '50', offset: '0' });
      if (search) params.set('q', search);
      if (role) params.set('role', role);
      if (status) params.set('status', status);

      const res = await fetch(`${API_BASE}/api/get/user/admin?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.items || []);
      setTotalUsers(data.total || 0);
    } catch {
      showNotice('error', 'Erreur de chargement des utilisateurs.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/documents/pending`);
      if (!res.ok) throw new Error();
      setDocuments(await res.json());
    } catch {
      showNotice('error', 'Erreur de chargement des documents.');
    }
  };

  const fetchForfaits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/forfaits`);
      if (!res.ok) throw new Error();
      setForfaits(await res.json());
    } catch {
      showNotice('error', 'Erreur de chargement des forfaits.');
    }
  };

  // Recharger les données quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'documents') fetchDocuments();
    if (activeTab === 'forfaits') fetchForfaits();
  }, [activeTab, search, role, status]);


  /* ── Actions globales ── */
  const handleDocStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/documents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut_verification: status })
      });
      if (!res.ok) throw new Error();
      showNotice('success', `Document ${status.toLowerCase()} avec succès.`);
      fetchDocuments(); // Rafraichir la liste
    } catch {
      showNotice('error', 'Erreur lors de la validation du document.');
    }
  };

  const handleForfaitStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/forfaits/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: status })
      });
      if (!res.ok) throw new Error();
      showNotice('success', `Statut de l'abonnement mis à jour.`);
      fetchForfaits();
    } catch {
      showNotice('error', 'Erreur lors de la modification du forfait.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${deletingUser.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showNotice('success', 'Compte utilisateur RGPD supprimé.');
      setDeletingUser(null);
      fetchUsers();
    } catch {
      showNotice('error', "Échec de la suppression du compte.");
      setDeletingUser(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Notice notice={notice} onClose={() => setNotice(null)} />

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-[#0050AA] px-3 py-1 rounded-full">
              Backoffice
            </span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-secondary hover:text-brand-interaction transition-colors"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }}
          >
            ← Se déconnecter
          </Link>
        </div>

        {/* Navigation des Onglets (Tabs) */}
        <div className="max-w-7xl mx-auto px-5 flex gap-6 mt-4 border-b border-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-[#0050AA] text-[#0050AA]' : 'border-transparent text-secondary hover:text-anthracite'}`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors flex gap-2 items-center ${activeTab === 'documents' ? 'border-[#0050AA] text-[#0050AA]' : 'border-transparent text-secondary hover:text-anthracite'}`}
          >
            Justificatifs
            {documents.length > 0 && <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">{documents.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('forfaits')}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'forfaits' ? 'border-[#0050AA] text-[#0050AA]' : 'border-transparent text-secondary hover:text-anthracite'}`}
          >
            Abonnements Actifs
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="max-w-7xl mx-auto">

          {/* ──────────────── ONGLET : UTILISATEURS ──────────────── */}
          {activeTab === 'users' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-anthracite mb-1">Comptes Clients</h1>
                  <p className="text-secondary text-sm">Gérez les accès et les habilitations globales.</p>
                </div>
              </div>

              {/* Filtres Users */}
              <div className="bg-white rounded-2xl border border-border p-4 mb-6 grid sm:grid-cols-3 gap-3 shadow-sm">
                <Input placeholder="Rechercher (email...)" value={search} onChange={(e) => setSearch(e.target.value)} rightElement={<SearchIcon />} />
                <Select value={role} onChange={(e) => setRole(e.target.value)} placeholder="Tous les rôles" options={ROLE_OPTIONS} />
                <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Tous les statuts" options={STATUS_OPTIONS} />
              </div>

              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-page/50">
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-secondary">
                      <th className="px-5 py-4 font-semibold">Compte Connect</th>
                      <th className="px-5 py-4 font-semibold">Rôle</th>
                      <th className="px-5 py-4 font-semibold">Statut</th>
                      <th className="px-5 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? <tr><td colSpan={4} className="px-5 py-10 text-center">Chargement...</td></tr> :
                      users.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center">Aucun compte.</td></tr> :
                        users.map(u => (
                          <tr key={u.id} className="border-b border-border last:border-0 hover:bg-page/60">
                            <td className="px-5 py-3">
                              <p className="font-semibold text-anthracite">{u.firstName} {u.lastName}</p>
                              <p className="text-secondary text-xs">{u.email}</p>
                            </td>
                            <td className="px-5 py-3"><span className="bg-surface px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                            <td className="px-5 py-3"><StatusBadge banned={!!u.isBanned} /></td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleBanToggle(u)} title={u.isBanned ? 'Rétablir' : 'Bannir'} className={`p-2 rounded-lg transition-colors ${u.isBanned ? 'text-success hover:bg-[#EDFAF3]' : 'text-warning hover:bg-warning-light'}`}>
                                {u.isBanned ? <CheckCircleIcon /> : <BanIcon />}
                              </button>
                              <button onClick={() => setDeletingUser(u)} title="Supprimer RGPD" className="p-2 ml-2 rounded-lg text-danger hover:bg-danger-light/20 transition-colors">
                                <TrashIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────── ONGLET : DOCUMENTS (BACKOFFICE TST/BOURSE) ──────────────── */}
          {activeTab === 'documents' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-anthracite mb-1">Vérification Documentaire</h1>
                <p className="text-secondary text-sm">Validez les attestations de bourse et TST pour débloquer les abonnements.</p>
              </div>

              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-page/50">
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-secondary">
                      <th className="px-5 py-4 font-semibold">Document</th>
                      <th className="px-5 py-4 font-semibold">Porteur associé</th>
                      <th className="px-5 py-4 font-semibold">Date d'envoi</th>
                      <th className="px-5 py-4 font-semibold text-right">Décision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center font-medium text-success">Aucun document en attente.</td></tr> :
                      documents.map(doc => (
                        <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-page/60">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-light text-brand-interaction p-2 rounded-lg"><Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon></div>
                              <div>
                                <p className="font-semibold text-anthracite">{doc.type_document}</p>
                                <a href={`${API_BASE}${doc.chemin_fichier}`} target="_blank" rel="noreferrer" className="text-xs text-[#0050AA] hover:underline flex items-center gap-1 mt-0.5">
                                  <EyeIcon width={12} height={12} /> Voir le fichier
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold">{doc.firstName} {doc.lastName}</p>
                            <p className="text-secondary text-xs">{doc.type_profil}</p>
                          </td>
                          <td className="px-5 py-4 text-secondary">{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</td>
                          <td className="px-5 py-4 text-right">
                            <Button variant="outline" className="mr-2 border-danger text-danger hover:bg-danger hover:text-white" onClick={() => handleDocStatus(doc.id, 'Refusé')}>Refuser</Button>
                            <Button variant="primary" className="bg-success border-success hover:bg-success/90" onClick={() => handleDocStatus(doc.id, 'Validé')}>Valider</Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────── ONGLET : FORFAITS & ABONNEMENTS ──────────────── */}
          {activeTab === 'forfaits' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-anthracite mb-1">Abonnements Souscrits</h1>
                <p className="text-secondary text-sm">Vue globale du cycle de vie des titres de transport.</p>
              </div>

              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-page/50">
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-secondary">
                      <th className="px-5 py-4 font-semibold">Titre</th>
                      <th className="px-5 py-4 font-semibold">Porteur</th>
                      <th className="px-5 py-4 font-semibold">Payeur</th>
                      <th className="px-5 py-4 font-semibold">Statut</th>
                      <th className="px-5 py-4 font-semibold text-right">Action Rapide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forfaits.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center">Aucun forfait dans la base.</td></tr> :
                      forfaits.map(f => (
                        <tr key={f.id} className="border-b border-border last:border-0 hover:bg-page/60">
                          <td className="px-5 py-4 font-bold text-anthracite">{f.type_forfait}</td>
                          <td className="px-5 py-4">{f.porteur_prenom} {f.porteur_nom}</td>
                          <td className="px-5 py-4 text-secondary">{f.payeur_prenom} {f.payeur_nom}</td>
                          <td className="px-5 py-4"><SubStatusBadge statut={f.statut} /></td>
                          <td className="px-5 py-4 text-right">
                            <select
                              value={f.statut}
                              onChange={(e) => handleForfaitStatus(f.id, e.target.value)}
                              className="text-xs font-semibold rounded-lg border border-border bg-page px-2 py-1.5 focus:outline-none"
                            >
                              {SUB_STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modale de Suppression */}
      <Modal open={!!deletingUser} onClose={() => setDeletingUser(null)} title="Suppression RGPD">
        <p className="text-secondary text-sm mb-6">
          Êtes-vous sûr de vouloir supprimer définitivement le compte de <b>{deletingUser?.firstName} {deletingUser?.lastName}</b> ?
          Cette action détruira en cascade ses documents, forfaits et historiques de paiement associés.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingUser(null)}>Annuler</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Confirmer la suppression</Button>
        </div>
      </Modal>

    </div>
  );
}