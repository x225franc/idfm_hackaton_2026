import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { IconLayoutDashboard, IconTicket, IconUser, IconLogout } from '@tabler/icons-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau', icon: IconLayoutDashboard },
  { to: '/passes',    label: 'Passes',  icon: IconTicket           },
  { to: '/profil',    label: 'Profil',  icon: IconUser             },
];

export default function Header() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-border sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
                <Link to="/">
                    <Logo size="md" />
                </Link>
                {/* Liens privés visibles uniquement en session (sans intérêt — et redirigés vers /login — pour un visiteur déconnecté) */}
                {isLoggedIn && (
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                            const active = pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                        active
                                            ? 'bg-blue-light text-brand'
                                            : 'text-secondary hover:text-anthracite hover:bg-surface'
                                    }`}
                                >
                                    <Icon size={17} stroke={active ? 2.5 : 1.8} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-secondary hover:text-danger hover:bg-danger-light/20 transition-colors"
                    >
                        <IconLogout size={17} stroke={1.8} />
                        <span className="hidden sm:inline">Se déconnecter</span>
                    </button>
                ) : (
                    <div className="w-22" />
                )}
            </div>
        </header>
    );
}
