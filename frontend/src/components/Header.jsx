import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';

export default function Header() {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <Logo size="md" />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary">
          <Link to="#" className="hover:text-brand-interaction transition-colors">
            Nos offres
          </Link>
          <Link to="#" className="hover:text-brand-interaction transition-colors">
            Actualités
          </Link>
          <Link to="#" className="hover:text-brand-interaction transition-colors">
            Aide
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button className="text-xl" aria-label="Langue française">
            🇫🇷
          </button>
        </div>
      </div>
    </header>
  );
}
