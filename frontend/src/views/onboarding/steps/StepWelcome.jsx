import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
      <img src="/images/homepage_image.png" alt="Skyline de Paris" className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}

export default function StepWelcome({ onNext }) {
  const { t } = useTranslation();

  const BENEFITS = [
    { title: t('welcome.benefits.speed_title'),     desc: t('welcome.benefits.speed_desc') },
    { title: t('welcome.benefits.paperless_title'), desc: t('welcome.benefits.paperless_desc') },
    { title: t('welcome.benefits.payment_title'),   desc: t('welcome.benefits.payment_desc') },
  ];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="outline">{t('welcome.login')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="px-5 py-10 lg:py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-brand-interaction bg-blue-info px-3 py-1 rounded-full mb-4">
                {t('welcome.badge')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-anthracite leading-tight mb-4">
                {t('welcome.title_1')} <span className="text-brand">{t('welcome.title_highlight')}</span>
              </h1>
              <p className="text-secondary text-base lg:text-lg mb-8 max-w-md">
                {t('welcome.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" onClick={onNext}>
                  {t('welcome.cta')}
                  <ArrowIcon />
                </Button>
                <Link to="/login">
                  <Button variant="secondary" full>{t('welcome.already_account')}</Button>
                </Link>
              </div>
            </div>

            <SkylineIllustration />
          </div>
        </section>

        {/* ── Avantages ── */}
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

        {/* ── CTA bas de page ── */}
        <section className="px-5 py-12">
          <div className="max-w-6xl mx-auto bg-anthracite rounded-3xl px-6 py-10 lg:px-12 text-center">
            <h2 className="text-white text-2xl lg:text-3xl font-bold mb-2">{t('welcome.banner_title')}</h2>
            <p className="text-white/60 mb-6">{t('welcome.banner_subtitle')}</p>
            <Button variant="primary" onClick={onNext} className="mx-auto">
              {t('welcome.cta')}
              <ArrowIcon />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
