// Small inline icons that lucide doesn't have in the exact shape the design uses
type P = { size?: number; className?: string };

/** Four-point AI sparkle */
export const SparkleIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
  </svg>
);
