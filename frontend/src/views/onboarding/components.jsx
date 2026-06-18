import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';


export function OnboardingHeader({ onBack, progress, onLogoClick }) {
  return (
    <div className="sticky top-0 z-10 bg-white lg:static">
      <header className="flex items-center px-4 py-3 border-b border-border lg:px-8 lg:py-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour"
            className="p-2 -ml-2 rounded-lg text-anthracite hover:bg-surface transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1 flex justify-center lg:hidden">
          <button type="button" onClick={onLogoClick} aria-label="Retour à l'accueil">
            <Logo size="md" />
          </button>
        </div>
        <div className="w-9 lg:hidden" />
      </header>
      {typeof progress === 'number' && (
        <div className="h-1 bg-border lg:hidden">
          <div className="h-1 bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export function OnboardingSidebar({ steps, labels, currentIndex, onGoTo, onLogoClick }) {
  const { t } = useTranslation();
  return (
    <aside className="hidden lg:flex lg:w-[380px] xl:w-[420px] lg:sticky lg:top-0 lg:self-start lg:h-screen flex-col justify-between bg-gradient-to-br from-brand to-brand-focus text-white p-10 shrink-0">
      <div>
        <button type="button" onClick={onLogoClick} aria-label="Retour à l'accueil" className="block mb-12">
          <img src="/comutitres_v_blanc.svg" alt="Comutitres" className="h-9 w-auto" />
        </button>

        {currentIndex >= 0 && (
          <nav className="flex flex-col gap-1">
            {steps.map((s, i) => {
              const status = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming';
              return (
                <button
                  key={s}
                  type="button"
                  disabled={status === 'upcoming'}
                  onClick={() => onGoTo(s)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    status === 'active' ? 'bg-white/15' : status === 'done' ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      status === 'done'
                        ? 'bg-white text-brand'
                        : status === 'active'
                          ? 'border-2 border-white'
                          : 'border-2 border-white/40'
                    }`}
                  >
                    {status === 'done' ? '✓' : i + 1}
                  </span>
                  <span className={`text-sm font-medium ${status === 'upcoming' ? 'text-white/60' : 'text-white'}`}>
                    {labels[s]}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <p className="text-xs text-white/60">
        {t('steps.footer', { year: new Date().getFullYear() })}
      </p>
    </aside>
  );
}

export function RadioRow({ selected, onSelect, label, sub, img, color = '#1972D2', bg }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer ${
        selected ? 'shadow-sm' : 'border-border hover:border-secondary/30'
      }`}
      style={{ borderColor: selected ? color : undefined, background: selected ? bg || '#fff' : '#fff' }}
    >
      {img && <img src={img} alt="" className="w-10 h-10 object-contain shrink-0" draggable={false} />}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-anthracite text-base">{label}</p>
        {sub && <p className="text-secondary text-sm">{sub}</p>}
      </div>
      <span
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: selected ? color : '#DDDDDD' }}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
      </span>
    </button>
  );
}
