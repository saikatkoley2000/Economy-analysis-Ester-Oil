export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      aria-label="Transformer Oil Financial Comparison logo"
    >
      <rect x="1" y="1" width="38" height="38" rx="6" stroke="currentColor" strokeWidth="1.5" />
      {/* Stylised transformer / droplet mark */}
      <path
        d="M20 8 L28 22 H24 L24 30 H16 L16 22 H12 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M20 8 L28 22 H24 L24 30 H16 L16 22 H12 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}
