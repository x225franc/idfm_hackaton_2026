import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setSuccess(null);
            return;
        }

        if (!token) {
            setError('Jeton de réinitialisation manquant ou invalide.');
            setSuccess(null);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const API_BASE = window.config?.BACKEND_URL;

        try {
            const response = await fetch(`${API_BASE}/api/reset-password?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Votre mot de passe a bien été mis à jour. Redirection vers la page de connexion...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (err) {
            console.error(err);
            setError('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="flex items-center px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
                <div className="flex-1 flex justify-center">
                    <Logo size="md" />
                </div>
            </header>

            <div className="flex-1 px-5 py-7 w-full max-w-lg mx-auto">
                <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">Nouveau mot de passe</h1>
                <p className="text-secondary text-base mb-8">
                    Veuillez configurer vos nouveaux identifiants de connexion sécurisés.
                </p>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm font-medium">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-300 text-green-700 text-sm font-medium">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Input
                        label="Nouveau mot de passe"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                        title="Le mot de passe doit contenir au moins 8 caractères."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" variant="primary" full disabled={loading}>
                        {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
                    </Button>
                </form>
            </div>
        </div>
    );
}