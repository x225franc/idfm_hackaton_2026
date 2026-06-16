export default function Logo({ size = 'md', className = '' }) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <img
      src="/images/logo.svg"
      alt="Comutitres"
      className={`${heights[size]} w-auto object-contain ${className}`}
    />
  );
}
