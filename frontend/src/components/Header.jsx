import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="mb-10">
            <nav className="flex gap-6 border-b border-slate-300 pb-4">
                <Link to="/" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    Accueil
                </Link>
            </nav>
        </header>
    );
}