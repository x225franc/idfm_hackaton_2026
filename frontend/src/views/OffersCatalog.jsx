import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import PageHeading from '@/components/PageHeading';
import { PROFILES, getOffers } from './onboarding/data';
import { STEPS } from './onboarding/Onboarding';

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function ProfileFlipCard({ profile, flipped, onToggle, onSubscribe }) {
  const { offers } = getOffers(profile.id);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-pressed={flipped}
      aria-label={`${profile.label} — ${flipped ? 'revenir' : 'voir les offres et conditions'}`}
      className="cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative w-full h-72 lg:h-64 transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div
          className="absolute inset-0 rounded-2xl border border-border bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 flex items-center justify-center" style={{ background: profile.bg }}>
            <img src={profile.img} alt="" className="w-20 h-20 lg:w-20 lg:h-20 object-contain" draggable={false} />
          </div>
          <div className="px-3 py-3 text-center border-t border-border">
            <p className="font-bold text-anthracite text-sm truncate">{profile.label}</p>
            {profile.sub && <p className="text-secondary text-xs truncate">{profile.sub}</p>}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl border-2 p-3 lg:p-4 flex flex-col shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: profile.color,
            background: profile.bg,
            pointerEvents: flipped ? 'auto' : 'none',
          }}
        >
          <p className="font-bold text-anthracite text-sm mb-1">{profile.label}</p>
          <p className="text-[11px] lg:text-[11px] text-secondary leading-snug mb-2">
            {profile.summary}
          </p>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-0.5 -mr-0.5">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white/85 rounded-xl px-2.5 py-2 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-anthracite truncate flex items-center gap-1">
                    {offer.name}
                    {offer.recommended && (
                      <span className="text-[9px] font-bold uppercase text-brand-interaction">★</span>
                    )}
                  </p>
                  <p className="text-[10px] text-secondary truncate">
                    {offer.priceLabel ?? `${formatPrice(offer.price)} €/${offer.period}`}
                  </p>
                </div>
                <button
                  type="button"
                  tabIndex={flipped ? 0 : -1}
                  onClick={(e) => { e.stopPropagation(); onSubscribe(profile.id, offer.id); }}
                  className="text-[10px] font-bold text-white px-2 py-1 rounded-lg shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: profile.color }}
                >
                  Souscrire
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OffersCatalog() {
  const navigate = useNavigate();
  const [flippedId, setFlippedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const toggle = (id) => setFlippedId((prev) => (prev === id ? null : id));


  const handleSubscribe = (profileId, offerId) => {
    navigate('/', { state: { startStep: STEPS.indexOf('documents'), profile: profileId, offerId } });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.offsetWidth));
  };

  const scrollToIndex = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <HeroBanner title="Offres" subtitle="Trouvez le forfait adapté à votre situation" />

      <main className="flex-1 py-10 w-full">
        <div className="px-5 max-w-5xl mx-auto">
          <PageHeading
            title="Quelle est votre situation ?"
            description="Touchez une carte pour découvrir les forfaits disponibles, leurs tarifs et leurs conditions d'éligibilité."
            className="mb-8"
          />
        </div>

        <div className="lg:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          >
            {PROFILES.map((profile) => (
              <div key={profile.id} className="snap-center shrink-0 w-full px-5">
                <ProfileFlipCard
                  profile={profile}
                  flipped={flippedId === profile.id}
                  onToggle={() => toggle(profile.id)}
                  onSubscribe={handleSubscribe}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-1.5 mt-5">
            {PROFILES.map((profile, i) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Voir ${profile.label}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-brand' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:block px-5 max-w-5xl mx-auto">
          <div className="grid grid-cols-5 gap-5">
            {PROFILES.map((profile) => (
              <ProfileFlipCard
                key={profile.id}
                profile={profile}
                flipped={flippedId === profile.id}
                onToggle={() => toggle(profile.id)}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-secondary mt-8 px-5">
          Pas sûr de votre situation ?{' '}
          <Link to="/" className="text-brand-interaction font-semibold hover:underline">
            Laissez-nous vous guider
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
