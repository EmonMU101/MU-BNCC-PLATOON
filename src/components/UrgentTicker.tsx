import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface UrgentTickerProps {
  sheetCsvUrl?: string;
  defaultNotice?: string;
  className?: string;
}

export const UrgentTicker: React.FC<UrgentTickerProps> = ({
  sheetCsvUrl = '',
  defaultNotice = '*** URGENT NOTICE: MU BNCC Platoon Intake 2025–2026 application dossiers are currently under review. Candidates must report with original Student ID and physical training sportswear for preliminary fitness screening at the MU Central Sports Ground. Regular university parade drills scheduled every Sunday & Wednesday at 06:45 AM sharp. ***',
  className = '',
}) => {
  const [noticeText, setNoticeText] = useState<string>(defaultNotice);

  useEffect(() => {
    if (!sheetCsvUrl) return;

    let isMounted = true;

    fetch(sheetCsvUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && !data.includes('<!DOCTYPE html>')) {
          setNoticeText('*** ' + data.trim() + ' ***');
        } else {
          setNoticeText(defaultNotice);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNoticeText(defaultNotice);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sheetCsvUrl, defaultNotice]);

  return (
    <div
      className={`news-ticker-container flex w-full items-center overflow-hidden rounded-[2.4rem] bg-[#f7f7f7] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1.5 transition-all shadow-[-4px_-4px_6px_#ffffff,4px_4px_6px_rgba(209,209,209,0.7)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${className}`}
      role="region"
      aria-label="Urgent platoon announcements"
    >
      {/* The 'URGENT' Badge */}
      <div className="news-ticker-title flex shrink-0 items-center gap-2 px-4 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-base md:text-lg font-extrabold uppercase tracking-wider text-black dark:text-white font-heading z-10 whitespace-nowrap">
        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75" />
          <span className="relative inline-flex h-full w-full rounded-full bg-red-600" />
        </span>
        <span className="tracking-[1.2px]">URGENT</span>
      </div>

      {/* The Scrolling Area with Inset Shadow */}
      <div className="news-ticker-content relative flex w-full items-center overflow-hidden rounded-[2.4rem] bg-[#f7f7f7] dark:bg-slate-950 px-3 py-2 sm:px-5 sm:py-3 shadow-[inset_7px_7px_10px_rgba(97,97,97,0.08),inset_-7px_-7px_10px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]">
        <span
          className="ticker-text-scroll text-xs sm:text-sm md:text-base font-bold text-[#707070] dark:text-slate-300 font-sans tracking-wide"
          title="Hover to pause notice"
        >
          {noticeText}
        </span>
      </div>
    </div>
  );
};
