export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <img
      src="/mart.jpg"
      alt="Mart Logo"
      className={`rounded-2xl object-cover shadow-2xs ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
}
