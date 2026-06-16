import { Link } from 'react-router-dom';
import { IconBrandX, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';

export default function Footer() {
  return (
    <footer className="bg-anthracite text-white mt-12">
      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-72 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/images/logo.svg"
                alt="Comutitres"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed italic">
              En partenariat avec{' '}
              <span className="text-white/80 font-medium">Île-de-France Mobilités</span> pour
              faciliter vos déplacements quotidiens.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-white/70 flex-1">
            {[
              'Mentions légales',
              'Données personnelles',
              'Accessibilité',
              'CGU',
              'Plan du site',
              'Cookies',
            ].map((l) => (
              <Link key={l} to="#" className="hover:text-white transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <IconBrandX size={16} stroke={2} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <IconBrandInstagram size={16} stroke={2} />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <IconBrandLinkedin size={16} stroke={2} />
            </a>
          </div>
          <p className="text-sm text-white/40">© 2024 COMUTITRES — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
