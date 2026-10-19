import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface MilitaryBannerGraphicProps {
  variant?: 'parade' | 'drill' | 'tactical';
  className?: string;
}

export const MilitaryBannerGraphic: React.FC<MilitaryBannerGraphicProps> = ({
  variant = 'parade',
  className = '',
}) => {
  const { t, isBn } = useLanguage();

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-6 sm:p-8 text-white shadow-sm ${className}`}
    >
      {/* Subtle Radar Accents */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radar Rings */}
        <circle cx="85%" cy="30%" r="140" fill="none" stroke="#EF4444" strokeWidth="0.8" opacity="0.3" />
        <circle cx="85%" cy="30%" r="220" fill="none" stroke="#EAB308" strokeWidth="0.8" opacity="0.2" />
      </svg>

      {/* Decorative Gold & Crimson Corner Marks */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-500" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-500" />

      {/* Foreground Scene */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded border border-red-500/30 bg-red-950/40 px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>
              {t('militaryBanner.battalion') || (isBn
                ? '৭ বিএনসিসি ব্যাটালিয়ন · ময়নামতি রেজিমেন্ট'
                : '7 BNCC Battalion · Moinamati Regiment')}
            </span>
          </div>

          <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
            {t('militaryBanner.motto') || (isBn
              ? 'শৃঙ্খলা · জ্ঞান · স্বেচ্ছাসেবা'
              : 'Discipline · Knowledge · Voluntary Service')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('militaryBanner.description') || (isBn
              ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি ক্যাডেটরা নিবিড় মাঠপর্যায়ের প্রশিক্ষণ, চরিত্র গঠন ও একাডেমিক উৎকর্ষের মাধ্যমে জাতীয় স্বেচ্ছাসেবার সর্বোচ্চ ঐতিহ্য ও শৃঙ্খলা ধারণ করে।'
              : 'Metropolitan University BNCC cadets undergo comprehensive field training, character development, and academic excellence, embodying the highest traditions of national volunteerism.')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t('militaryBanner.wingArmy') || (isBn ? 'আর্মি উইং ক্যাডেট' : 'Army Wing Cadets')}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t('militaryBanner.readiness') || (isBn ? 'ত্রি-বাহিনী প্রস্তুতি' : 'Tri-Service Readiness')}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>{t('militaryBanner.campus') || (isBn ? 'বটেশ্বর ক্যাম্পাস' : 'Bateshwar Campus')}</span>
            </span>
          </div>
        </div>

        {/* Visual Cadet formation insignia badge */}
        <div className="shrink-0 flex items-center justify-center p-4 rounded-xl border border-slate-700/60 bg-slate-850/80 shadow-inner">
          <svg viewBox="0 0 200 120" className="w-48 sm:w-56 h-auto drop-shadow-lg" fill="none">
            {/* Cadet Formation Silhouettes */}
            {/* Squad Leader */}
            <circle cx="100" cy="30" r="10" fill="#E2E8F0" />
            <path d="M 85 62 L 100 45 L 115 62 L 115 90 L 85 90 Z" fill="#E2E8F0" />
            {/* Cadet 1 */}
            <circle cx="60" cy="40" r="8" fill="#94A3B8" />
            <path d="M 48 68 L 60 52 L 72 68 L 72 90 L 48 90 Z" fill="#94A3B8" />
            {/* Cadet 2 */}
            <circle cx="140" cy="40" r="8" fill="#94A3B8" />
            <path d="M 128 68 L 140 52 L 152 68 L 152 90 L 128 90 Z" fill="#94A3B8" />
            {/* Cadet 3 */}
            <circle cx="25" cy="50" r="7" fill="#64748B" />
            <path d="M 15 75 L 25 60 L 35 75 L 35 90 L 15 90 Z" fill="#64748B" />
            {/* Cadet 4 */}
            <circle cx="175" cy="50" r="7" fill="#64748B" />
            <path d="M 165 75 L 175 60 L 185 75 L 185 90 L 165 90 Z" fill="#64748B" />
            {/* Parade Ground Line */}
            <line x1="10" y1="92" x2="190" y2="92" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 3" />
            {/* Ground label */}
            <text x="100" y="110" textAnchor="middle" fill="#EAB308" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
              {t('militaryBanner.squadron') || (isBn ? 'এমইউ প্যারেড স্কোয়াড্রন' : 'MU PARADE SQUADRON')}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
