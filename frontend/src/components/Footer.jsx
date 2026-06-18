import { Link } from 'react-router-dom';
import { IconBrandX, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-border mt-12">
            <div className="max-w-7xl mx-auto px-5 py-10">
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="md:w-72 shrink-0">
                        <Logo size="sm" className="mb-3" />
                        <p className="text-sm text-secondary leading-relaxed italic">
                            En partenariat avec{' '}
                            <span className="text-anthracite font-medium">Île-de-France Mobilités</span> pour
                            faciliter vos déplacements quotidiens.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-secondary flex-1">
                        {[
                            'Mentions légales',
                            'Données personnelles',
                            'Accessibilité',
                            'CGU',
                            'Plan du site',
                            'Cookies',
                        ].map((l) => (
                            <Link key={l} to="#" className="hover:text-anthracite transition-colors">
                                {l}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-surface hover:bg-border text-anthracite flex items-center justify-center transition-colors"
                        aria-label="Twitter"
                    >
                        <IconBrandX size={16} stroke={2} />
                    </a>
                    <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-surface hover:bg-border text-anthracite flex items-center justify-center transition-colors"
                        aria-label="Instagram"
                    >
                        <IconBrandInstagram size={16} stroke={2} />
                    </a>
                    <a
                        href="#"
                        className="w-9 h-9 rounded-full bg-surface hover:bg-border text-anthracite flex items-center justify-center transition-colors"
                        aria-label="LinkedIn"
                    >
                        <IconBrandLinkedin size={16} stroke={2} />
                    </a>
                </div>

                <div className="border-t border-border pt-6 text-center">
                    <p className="text-xs font-bold tracking-widest text-anthracite uppercase">
                        © 2024 Comutitres
                    </p>
                    <p className="text-xs text-secondary mt-1">Tous droits réservés</p>
                </div>
            </div>
        </footer>
    );
}
