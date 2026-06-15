import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="p-6 bg-red-50 text-red-600 rounded-lg border border-red-200 text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur 404 - Page introuvable</h2>
            <p className="mb-4">Il semblerait que cette route n'existe pas encore.</p>
            <Link to="/" className="text-red-700 font-semibold hover:underline">
                Retourner à l'accueil
            </Link>
        </div>
    );
}