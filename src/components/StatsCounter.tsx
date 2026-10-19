import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Trophy,
  Target,
  Award,
  Star,
  Activity,
  Flame,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  FieldRecordItem,
  subscribeFieldRecords,
  DEFAULT_FIELD_RECORDS,
} from '../services/platoonCmsService';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Trophy,
  Target,
  Award,
  Star,
  Activity,
  Flame,
  Shield,
};

export const StatsCounter: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [fieldRecords, setFieldRecords] = useState<FieldRecordItem[]>(DEFAULT_FIELD_RECORDS);
  const [counts, setCounts] = useState<number[]>([]);

  // Subscribe to real-time dynamic database entries
  useEffect(() => {
    const unsubscribe = subscribeFieldRecords((items) => {
      setFieldRecords(items);
    });
    return () => unsubscribe();
  }, []);

  // Smooth numeric counter animation whenever fieldRecords change
  useEffect(() => {
    if (fieldRecords.length === 0) return;

    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      // ease-out cubic
      const factor = 1 - Math.pow(1 - progress, 3);

      setCounts(
        fieldRecords.map((stat) => Math.round((stat.value || 0) * factor))
      );

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [fieldRecords]);

  const defaultIcons = [Users, Compass, HeartHandshake, ShieldCheck];

  const formatNumber = (num: number) => {
    if (!isBn) return String(num);
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)] || d);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {fieldRecords.map((stat, idx) => {
        const Icon = (stat.iconName && ICON_MAP[stat.iconName]) || defaultIcons[idx % defaultIcons.length];
        const labelText = isBn ? (stat.labelBn || stat.label) : stat.label;
        const noteText = isBn ? (stat.noteBn || stat.note) : stat.note;

        return (
          <div
            key={stat.id || stat.label}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-md transition-all hover:border-red-500/40"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-950/60 dark:group-hover:text-red-400 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {stat.category || t('common.verified')}
              </span>
            </div>

            <div className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatNumber(counts[idx] !== undefined ? counts[idx] : stat.value)}
              <span className="text-red-600 dark:text-red-500">{stat.suffix}</span>
            </div>

            <div className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {labelText}
            </div>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {noteText}
            </p>
          </div>
        );
      })}
    </div>
  );
};
