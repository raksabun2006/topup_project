export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#009F6B] via-emerald-500 to-blue-600 p-2 text-white shadow-md shadow-emerald-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-xs"
      >
        {/* Shopping Bag Handle */}
        <path
          d="M17 17V12C17 8.134 20.134 5 24 5C27.866 5 31 8.134 31 12V17"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Modern Geometric Bag Body forming an 'M' Monogram */}
        <path
          d="M9 17H39L35.5 41C35.2 42.7 33.7 44 32 44H16C14.3 44 12.8 42.7 12.5 41L9 17Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Stylized 'M' Inner Fold / Wings */}
        <path
          d="M14 21L24 33L34 21"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center Spark / Star */}
        <circle cx="24" cy="23" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
