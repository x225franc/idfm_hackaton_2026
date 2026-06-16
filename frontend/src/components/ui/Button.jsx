export default function Button({
  children,
  variant = 'primary',
  full = false,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base transition-all duration-200 py-3.5 px-6 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand text-white hover:bg-brand-hover active:bg-brand-focus shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-brand-interaction border-2 border-brand-interaction hover:bg-blue-light',
    ghost:
      'bg-transparent text-brand-interaction hover:bg-blue-light',
    outline:
      'bg-white text-anthracite border border-border hover:bg-surface',
    danger:
      'bg-danger text-white hover:bg-danger-light',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
