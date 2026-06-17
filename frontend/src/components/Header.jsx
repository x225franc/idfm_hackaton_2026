import { Link, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { IconLayoutDashboard, IconTicket, IconUser } from '@tabler/icons-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau', icon: IconLayoutDashboard },
  { to: '/passes',    label: 'Passes',  icon: IconTicket           },
  { to: '/profil',    label: 'Profil',  icon: IconUser             },
];

export default function Header() {
    const { pathname } = useLocation();

    return (
        <header className="bg-white border-b border-border sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
                <Logo size="md" />
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
                <div className="w-22" />
            </div>
        </header>
    );
}
