import React from 'react';

export interface BnccCrestProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

/**
 * Official Bangladesh National Cadet Corps (BNCC) Monogram & Emblem
 * Exact vector replica of the official BNCC logo:
 * - Outer Red Boundary Ring
 * - Black Circular Band with "Knowledge & Discipline" (top) and "The Volunteers" (bottom) flanked by two yellow 5-point stars
 * - Inner Yellow Field with Red Border
 * - Central 3D Tri-Service Pyramid:
 *     * Top sector: Red (Army Wing)
 *     * Bottom-left sector: Navy Blue (Navy Wing)
 *     * Bottom-right sector: Sky Blue (Air Force Wing)
 * - Bold black "BNCC" wordmark at the base of the triangle
 */
export const BnccCrest: React.FC<BnccCrestProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28 sm:w-36 sm:h-36',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className={`${sizeMap[size]} shrink-0 select-none drop-shadow-sm transition-transform duration-200 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bangladesh National Cadet Corps (BNCC) Official Logo"
      >
        <defs>
          {/* Top text arc: Knowledge & Discipline */}
          <path
            id="bnccTopArc"
            d="M 45 250 A 205 205 0 1 1 455 250"
            fill="none"
          />

          {/* Bottom text arc: The Volunteers (oriented for upright reading) */}
          <path
            id="bnccBottomArc"
            d="M 85 348 A 205 205 0 0 0 415 348"
            fill="none"
          />
        </defs>

        {/* 1. Outer Red Thin Ring */}
        <circle
          cx="250"
          cy="250"
          r="245"
          fill="#D8232A"
          stroke="#D8232A"
          strokeWidth="2"
        />

        {/* 2. Black Circular Ring */}
        <circle
          cx="250"
          cy="250"
          r="241"
          fill="#1C1B1A"
        />

        {/* 3. Red Dividing Ring between Black Band and Yellow Disc */}
        <circle
          cx="250"
          cy="250"
          r="174"
          fill="#FFE000"
          stroke="#D8232A"
          strokeWidth="6.5"
        />

        {/* 4. Top Text: "Knowledge & Discipline" */}
        <text
          fill="#FFE000"
          fontSize="36.5"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.2"
        >
          <textPath
            href="#bnccTopArc"
            startOffset="50%"
            textAnchor="middle"
          >
            Knowledge &amp; Discipline
          </textPath>
        </text>

        {/* 5. Flanking 5-Point Yellow Stars */}
        {/* Left Star (~8 o'clock) */}
        <g transform="translate(48, 328) rotate(-22)">
          <polygon
            points="0,-16 4.7,-4.9 16.7,-3.2 7.8,4.9 10.3,16.8 0,10.8 -10.3,16.8 -7.8,4.9 -16.7,-3.2 -4.7,-4.9"
            fill="#FFE000"
          />
        </g>

        {/* Right Star (~4 o'clock) */}
        <g transform="translate(452, 328) rotate(22)">
          <polygon
            points="0,-16 4.7,-4.9 16.7,-3.2 7.8,4.9 10.3,16.8 0,10.8 -10.3,16.8 -7.8,4.9 -16.7,-3.2 -4.7,-4.9"
            fill="#FFE000"
          />
        </g>

        {/* 6. Bottom Text: "The Volunteers" */}
        <text
          fill="#FFE000"
          fontSize="38"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.8"
        >
          <textPath
            href="#bnccBottomArc"
            startOffset="50%"
            textAnchor="middle"
          >
            The Volunteers
          </textPath>
        </text>

        {/* 7. Central Tri-Colored 3D Pyramid */}
        {/* Top Face: Crimson Red (Army Wing) */}
        <polygon
          points="250,68 172,208 250,264 328,208"
          fill="#E1251B"
        />

        {/* Bottom-Left Face: Deep Navy Blue (Navy Wing) */}
        <polygon
          points="172,208 94,336 250,336 250,264"
          fill="#1C3F94"
        />

        {/* Bottom-Right Face: Vivid Sky Blue (Air Force Wing) */}
        <polygon
          points="328,208 250,264 250,336 406,336"
          fill="#009FE3"
        />

        {/* 8. Bold Black "BNCC" Wordmark */}
        <text
          x="250"
          y="396"
          textAnchor="middle"
          fill="#1C1B1A"
          fontSize="56"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="2.5"
        >
          BNCC
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading text-lg font-bold tracking-wider text-slate-900 uppercase dark:text-white leading-tight">
            MU BNCC Platoon
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Metropolitan University BNCC Platoon
          </span>
        </div>
      )}
    </div>
  );
};

export default BnccCrest;
