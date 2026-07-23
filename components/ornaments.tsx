/**
 * Islamic-geometry ornaments, used per DESIGN.md's Pattern-Is-Punctuation
 * Rule: an ambient band behind the header, a divider between shelves, a
 * khatam mark for empty states. Nothing tiled full-page; nothing repeated
 * per-card.
 */

export function AmbientBand() {
  return (
    <div className="ambient" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="lhp-star" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M60 8 L112 60 L60 112 L8 60 Z" />
              <path d="M22 22 L98 22 L98 98 L22 98 Z" />
              <path d="M60 22 L98 60 L60 98 L22 60 Z" />
              <circle cx="60" cy="60" r="10" />
            </g>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#lhp-star)" />
      </svg>
    </div>
  );
}

export function ShelfDivider() {
  return (
    <div className="shelf-divider" aria-hidden="true">
      <svg viewBox="0 0 240 24" width="240" height="24" preserveAspectRatio="xMidYMid meet">
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <line x1="0" y1="12" x2="96" y2="12" />
          <line x1="144" y1="12" x2="240" y2="12" />
          <g transform="translate(120 12)">
            <path d="M0-10 L10 0 L0 10 L-10 0 Z" />
            <path d="M0-10 L10 0 L0 10 L-10 0 Z" transform="rotate(45)" />
            <circle r="1.5" fill="currentColor" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function KhatamMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
        <rect x="16" y="16" width="64" height="64" />
        <rect x="16" y="16" width="64" height="64" transform="rotate(45 48 48)" />
        <circle cx="48" cy="48" r="6" />
      </g>
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" />
        <rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" />
      </g>
    </svg>
  );
}
