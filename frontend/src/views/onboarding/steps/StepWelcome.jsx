import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import Header from '../../../components/Header';

const BENEFITS = [
  {
    title: 'En quelques minutes',
    desc: "Indiquez votre profil et votre usage, on s'occupe de trouver l'offre la plus adaptée.",
  },
  {
    title: 'Sans paperasse',
    desc: 'Déposez vos justificatifs en ligne : tout est dématérialisé et sécurisé.',
  },
  {
    title: 'Paiement sécurisé',
    desc: 'Carte bancaire, prélèvement automatique ou paiement mobile, en toute confiance.',
  },
];

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SkylineIllustration() {
  return (
    <div className="relative h-64 lg:h-full lg:min-h-[420px] rounded-3xl overflow-hidden bg-[#EEF3FF]">
      <img
        src="/images/homepage_image.png"
        alt="Skyline de Paris"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export default function StepWelcome({ onNext }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="px-5 py-10 lg:py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-brand-interaction bg-blue-info px-3 py-1 rounded-full mb-4">
                Souscription 100% en ligne
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-anthracite leading-tight mb-4">
                Votre abonnement de transport en <span className="text-brand">quelques clics</span>
              </h1>
              <p className="text-secondary text-base lg:text-lg mb-8 max-w-md">
                Simplifions vos trajets au quotidien : trouvez l'offre adaptée à votre profil, déposez vos
                documents et payez en ligne, sans rendez-vous.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" onClick={onNext}>
                  Démarrer mon abonnement
                  <ArrowIcon />
                </Button>
                <Link to="/login">
                  <Button variant="secondary" full>J'ai déjà un compte</Button>
                </Link>
              </div>
            </div>

            <SkylineIllustration />
          </div>
        </section>

        {/* ── Pourquoi ── */}
        <section className="bg-white border-t border-border px-5 py-12">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <p className="font-bold text-anthracite mb-1.5">{b.title}</p>
                <p className="text-secondary text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
