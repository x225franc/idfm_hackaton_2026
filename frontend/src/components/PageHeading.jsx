export default function PageHeading({ title, description, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-[2rem] font-bold text-anthracite mb-1.5">{title}</h1>
      <p className="text-secondary text-base">{description}</p>
    </div>
  );
}
