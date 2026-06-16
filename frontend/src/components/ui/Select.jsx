export default function Select({
  label,
  name,
  id,
  value,
  onChange,
  required = false,
  error,
  options = [],
  placeholder,
  className = '',
}) {
  const selectId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] font-semibold text-anthracite uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-xl border py-3.5 px-4 text-anthracite text-base bg-white appearance-none
          focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow
          ${error ? 'border-danger' : 'border-border'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
