export default function Input({
  label,
  type = 'text',
  name,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  rightElement,
  className = '',
}) {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-semibold text-anthracite uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-xl border py-3.5 px-4 text-anthracite text-base placeholder-[#9CA3AF] bg-white
            focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow
            ${error ? 'border-danger' : 'border-border'}
            ${rightElement ? 'pr-12' : ''}`}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
