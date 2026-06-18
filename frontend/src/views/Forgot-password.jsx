import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const API_BASE = window.config?.BACKEND_URL;

        try {
            const response = await fetch(`${API_BASE}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || "Cet e-mail n'est pas associé à un compte.");
            }
        } catch (err) {
            console.error(err);
            setError('Impossible de joindre le serveur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="flex items-center px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
                <button
                    onClick={() => navigate('/login')}
                    className="p-2 -ml-2 rounded-lg text-anthracite hover:bg-surface transition-colors"
                    aria-label="Retour"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="flex-1 flex justify-center">
                    <Logo size="md" />
                </div>
                <div className="w-9" />
            </header>

            <div className="flex-1 px-5 py-7 w-full max-w-lg mx-auto">
                <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">Récupération</h1>
                <p className="text-secondary text-base mb-8">
                    Saisissez votre e-mail pour recevoir un lien de réinitialisation sécurisé.
                </p>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-danger-light/20 border border-danger text-danger text-sm font-medium flex items-start gap-2">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="p-5 rounded-2xl bg-[#EDFAF3] border border-success text-center">
                        <p className="font-bold text-success text-base mb-2">E-mail envoyé !</p>
                        <p className="text-secondary text-sm mb-6">
                            Veuillez vérifier votre boîte de réception afin de modifier votre mot de passe.
                        </p>
                        <Link to="/login">
                            <Button variant="primary" full>Retour à la connexion</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Input
                            label="Adresse e-mail"
                            type="email"
                            name="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="primary" full disabled={loading}>
                            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}