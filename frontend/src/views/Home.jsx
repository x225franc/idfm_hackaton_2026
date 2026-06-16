import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/* ── Profile data ── */
const PROFILES = [
  {
    id: 'actif',
    label: 'Actif',
    sub: '26-62',
    bg: '#EEF3FF',
    color: '#1972D2',
    img: '/images/personnage/Actif.svg',
  },
  {
    id: 'etudiant',
    label: 'Étudiant',
    sub: '-26',
    bg: '#EDFAF3',
    color: '#007D44',
    img: '/images/personnage/Jeune.svg',
  },
  {
    id: 'senior',
    label: 'Senior',
    sub: '+62',
    bg: '#F3F0FF',
    color: '#4F338B',
    img: '/images/personnage/Senior.svg',
  },
  {
    id: 'solidarite',
    label: 'Solidarité',
    sub: "Bénéficiaires d'aides sociales",
    bg: '#FFF0F8',
    color: '#E72F89',
    img: '/images/personnage/Solidaritee.svg',
  },
  {
    id: 'mobilite',
    label: 'Mobilité Réduite',
    sub: '',
    bg: '#FFF8EE',
    color: '#F39224',
    img: '/images/personnage/Mobilitereeduite.svg',
  },
];

/* ── Feature data ── */
const FEATURES = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: 'text-brand-interaction bg-blue-info',
    title: 'Paiement sécurisé',
    desc: 'Vos transactions sont protégées par les plus hauts standards de sécurité bancaire.',
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
      </svg>
    ),
    color: 'text-violet bg-[#F3F0FF]',
    title: 'Gestion simplifiée',
    desc: 'Gérez tous vos abonnements et ceux de votre famille depuis un espace unique.',
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: 'text-success bg-[#EDFAF3]',
    title: 'Accompagnement dédié',
    desc: 'Une équipe à votre écoute pour vous guider dans le choix de votre forfait.',
  },
];

/* ── News data ── */
const NEWS = [
  {
    id: 1,
    tag: 'TARIFICATION',
    tagColor: 'text-brand-interaction bg-blue-info',
    title: 'Nouveaux tarifs 2024',
    desc: 'Consultez les mises à jour...',
    imgBg: 'bg-gradient-to-br from-[#4A6FA8] to-[#253038]',
  },
  {
    id: 2,
    tag: 'OFFRES',
    tagColor: 'text-success bg-[#EDFAF3]',
    title: "Le forfait Liberté + s'étend",
    desc: 'Désormais disponible sur...',
    imgBg: 'bg-gradient-to-br from-[#007D44] to-[#253038]',
  },
];

/* ── Sub-components ── */
function ProfileCard({ profile, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(profile.id)}
      style={{
        borderColor: selected ? profile.color : 'transparent',
        background: selected ? profile.bg : 'white',
      }}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] cursor-pointer w-full
        ${selected ? 'shadow-md' : 'border-border'}`}
    >
      <img
        src={profile.img}
        alt={profile.label}
        className="w-16 h-16 object-contain"
        draggable={false}
      />
      <div className="text-center">
        <p className="text-sm font-bold text-anthracite leading-tight">{profile.label}</p>
        {profile.sub && (
          <p className="text-[11px] text-secondary leading-snug mt-0.5 whitespace-pre-line">
            {profile.sub}
          </p>
        )}
      </div>
    </button>
  );
}

function FeatureItem({ icon, color, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-anthracite mb-1">{title}</p>
        <p className="text-secondary text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function NewsCard({ item }) {
  return (
    <Link to="#" className="flex gap-3 group">
      <div
        className={`w-20 h-16 rounded-xl shrink-0 ${item.imgBg} flex items-center justify-center`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${item.tagColor}`}
        >
          {item.tag}
        </span>
        <p className="text-sm font-semibold text-anthracite group-hover:text-brand-interaction transition-colors leading-tight">
          {item.title}
        </p>
        <p className="text-xs text-secondary truncate">{item.desc}</p>
      </div>
    </Link>
  );
}

/* ── Main component ── */
export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-white pt-10 pb-8 px-5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 max-w-xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-black text-anthracite leading-tight mb-2">
                Votre abonnement en <span className="text-brand">1 seul clic&nbsp;!</span>
              </h1>
              <p className="text-secondary font-medium">Vous êtes ?</p>
            </div>

            {/* Profile grid */}
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {PROFILES.slice(0, 3).map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    selected={selectedProfile === p.id}
                    onSelect={setSelectedProfile}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-[66%] mx-auto">
                {PROFILES.slice(3).map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    selected={selectedProfile === p.id}
                    onSelect={setSelectedProfile}
                  />
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 mt-8 max-w-xs mx-auto">
              <Link to="/login" className="w-full">
                <Button variant="primary" full>
                  Se connecter
                </Button>
              </Link>
              <Link
                to="/register"
                className="text-brand-interaction font-semibold text-base hover:underline"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>

        {/* ── New banner ── */}
        <section className="px-5 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-info rounded-2xl p-5 border border-[#BDD5F0] max-w-xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-interaction mb-2 block">
                Nouveau
              </span>
              <p className="font-bold text-anthracite text-base">
                Forfait Liberté + maintenant disponible
              </p>
            </div>
          </div>
        </section>

        {/* ── Why section ── */}
        <section className="px-5 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-anthracite mb-7">
              Pourquoi choisir Comutitres ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <FeatureItem key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── News section ── */}
        <section className="px-5 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-anthracite">Actualités</h2>
              <Link to="#" className="text-sm text-brand-interaction font-semibold hover:underline">
                Tout voir
              </Link>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-5 max-w-2xl">
              {NEWS.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Help section ── */}
        <section className="px-5 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-page rounded-2xl p-8 text-center max-w-md mx-auto border border-border">
              <div className="w-12 h-12 rounded-full bg-blue-info flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1972D2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="font-bold text-anthracite text-lg mb-2">Besoin d'aide ?</h3>
              <p className="text-secondary text-sm leading-relaxed mb-6">
                Nos experts sont là pour répondre à vos questions sur les titres et abonnements.
              </p>
              <Link to="/faq">
                <Button variant="primary" full>
                  Consulter la FAQ
                </Button>
              </Link>
              <Link
                to="/contact"
                className="block text-brand-interaction font-semibold text-sm mt-4 hover:underline"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
