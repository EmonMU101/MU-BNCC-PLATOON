import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface BackToTopProps {
  /** Scroll distance in pixels before the button appears. Default is 300. */
  threshold?: number;
  /** Custom additional CSS classes */
  className?: string;
}

export const BackToTop: React.FC<BackToTopProps> = ({
  threshold = 300,
  className = '',
}) => {
  const { isBn, t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      setIsVisible(scrollY > threshold);

      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG Progress circle calculations (circumference for radius 18)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      } ${className}`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Scroll to top of page"
        className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <ChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5 text-inherit" />

        {/* Quiet Tooltip on hover */}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-white opacity-0 shadow-xs transition-opacity duration-200 group-hover:opacity-100 uppercase">
          Top
        </span>
      </button>
    </div>
  );
};

export default BackToTop;
