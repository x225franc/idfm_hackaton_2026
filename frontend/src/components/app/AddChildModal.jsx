import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const EMPTY_FORM = { firstName: '', lastName: '', birthDate: '', email: '' };

function calculateAge(birthDateStr) {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function AddChildModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [birthDateError, setBirthDateError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
    if (field === 'birthDate') setBirthDateError(null);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setBirthDateError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calculateAge(form.birthDate) >= 16) {
      setBirthDateError('Ce compte est réservé aux proches de moins de 16 ans.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const base = window.config?.BACKEND_URL ?? '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/family/add-child`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création du compte.');

      onCreated(data.child);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Ajouter un proche"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Créer le compte et envoyer les identifiants →'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom" value={form.firstName} onChange={handleChange('firstName')} required />
          <Input label="Nom" value={form.lastName} onChange={handleChange('lastName')} required />
        </div>

        <Input
          label="Date de naissance"
          type="date"
          value={form.birthDate}
          onChange={handleChange('birthDate')}
          error={birthDateError}
          required
        />

        <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required />

        <div className="bg-blue-info border border-[#BDD5F0] rounded-xl p-3.5 text-sm text-brand-interaction leading-relaxed">
          Un email sera envoyé avec les identifiants. Le paiement restera rattaché à votre compte.
        </div>
      </form>
    </Modal>
  );
}
