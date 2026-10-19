import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Shield,
  Download,
  ExternalLink,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Radio,
  FileDown,
} from 'lucide-react';
import { EventItem, UPCOMING_EVENTS } from '../data/siteData';
import { subscribeEvents, getAllEvents } from '../services/portalService';
import { useLanguage } from '../context/LanguageContext';

export interface EventsCalendarProps {
  initialCategory?: string;
  onSelectEvent?: (event: EventItem) => void;
  showHeading?: boolean;
  className?: string;
  cadetSession?: {
    cadetId?: string;
    fullName?: string;
    rank?: string;
  } | null;
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const BN_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toBnNumber = (num: number | string) =>
  num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

export const getCategoryStyles = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes('training') || norm.includes('প্রশিক্ষণ')) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-600 dark:bg-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      chip: 'hover:bg-blue-50 text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-700',
      activeChip: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    };
  }
  if (norm.includes('duty') || norm.includes('campus') || norm.includes('ডিউটি')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-600 dark:bg-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      chip: 'hover:bg-amber-50 text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700',
      activeChip: 'bg-amber-600 text-white border-amber-600 shadow-xs',
    };
  }
  if (norm.includes('camp') || norm.includes('parade') || norm.includes('ক্যাম্প') || norm.includes('প্যারেড')) {
    return {
      bg: 'bg-red-50 dark:bg-red-950/50',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-600 dark:bg-red-400',
      badge: 'bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
      chip: 'hover:bg-red-50 text-red-700 border-red-300 dark:text-red-300 dark:border-red-700',
      activeChip: 'bg-red-600 text-white border-red-600 shadow-xs',
    };
  }
  if (norm.includes('service') || norm.includes('community') || norm.includes('সেবা')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      chip: 'hover:bg-emerald-50 text-emerald-700 border-emerald-300 dark:text-emerald-300 dark:border-emerald-700',
      activeChip: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    };
  }
  return {
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    dot: 'bg-slate-600 dark:bg-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    chip: 'hover:bg-slate-100 text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-700',
    activeChip: 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 shadow-xs',
  };
};

export const EventsCalendar: React.FC<EventsCalendarProps> = ({
  initialCategory = 'All',
  onSelectEvent,
  showHeading = true,
  className = '',
  cadetSession = null,
}) => {
  const { isBn } = useLanguage();

  // State
  const [events, setEvents] = useState<EventItem[]>(UPCOMING_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [isDbSynced, setIsDbSynced] = useState(false);

  // Month navigation (Defaults to October 2026, active platoon operational month)
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 9, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>('2026-10-14');
  const [activeEventDetail, setActiveEventDetail] = useState<EventItem | null>(null);

  // 1. Fetch official training schedules and important dates from the database
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    // Initial explicit fetch
    getAllEvents()
      .then((data) => {
        if (isSubscribed && data && data.length > 0) {
          setEvents(data);
          setIsDbSynced(true);
        }
      })
      .catch((err) => {
        console.warn('Initial fetch error in EventsCalendar:', err);
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    // Real-time Firestore subscription
    const unsubscribe = subscribeEvents((liveEvents) => {
      if (isSubscribed && liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
        setIsDbSynced(true);
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Compute dynamic category list from database events
  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    events.forEach((evt) => {
      if (evt.category) categoriesSet.add(evt.category);
    });
    return ['All', ...Array.from(categoriesSet)];
  }, [events]);

  // Filter events by selected category and search query
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchCategory =
        selectedCategory === 'All' ||
        evt.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        (evt.titleBn && evt.titleBn.toLowerCase().includes(q)) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.instructorOrLead.toLowerCase().includes(q) ||
        evt.mandatoryTurnout.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  // Counts per category for badge indicators
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: events.length };
    events.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [events]);

  // Calendar Calculations
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarGrid = useMemo(() => {
    const cells: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }> = [];

    // Trailing days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = calMonth === 0 ? 11 : calMonth - 1;
      const prevY = calMonth === 0 ? calYear - 1 : calYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // Trailing days from next month
    const remainder = cells.length % 7;
    const remainingCount = remainder === 0 ? 0 : 7 - remainder;
    for (let d = 1; d <= remainingCount; d++) {
      const nextM = calMonth === 11 ? 0 : calMonth + 1;
      const nextY = calMonth === 11 ? calYear + 1 : calYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: false });
    }

    return cells;
  }, [calYear, calMonth, firstDayOfWeek, totalDaysInMonth, daysInPrevMonth]);

  // Map of events by date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    filteredEvents.forEach((evt) => {
      if (!evt.date) return;
      const current = map.get(evt.date) || [];
      current.push(evt);
      map.set(evt.date, current);
    });
    return map;
  }, [filteredEvents]);

  // Selected Date events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return eventsByDate.get(selectedDateStr) || [];
  }, [selectedDateStr, eventsByDate]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCalendarDate(new Date(2026, 9, 1)); // October 2026
    setSelectedDateStr('2026-10-14');
  };

  const handleRefreshEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEvents();
      if (data && data.length > 0) {
        setEvents(data);
        setIsDbSynced(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // .ICS file generation
  const handleDownloadIcs = (evt: EventItem) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Metropolitan University//MU BNCC Cadet Calendar//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}\\nTurnout: ${evt.mandatoryTurnout}\\nLead: ${evt.instructorOrLead}`,
      `LOCATION:${evt.venue}`,
      `DTSTART:${evt.date.replace(/-/g, '')}T064500Z`,
      `DTEND:${evt.date.replace(/-/g, '')}T090000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id || 'event'}-mu-bncc.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (evt: EventItem) => {
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(
      `${evt.description}\n\nMandatory Turnout: ${evt.mandatoryTurnout}\nInstructor/Lead: ${evt.instructorOrLead}`
    );
    const location = encodeURIComponent(evt.venue);
    const dateFormatted = evt.date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T004500Z/${dateFormatted}T030000Z`;
  };

  const getCategoryLabel = (category: string) => {
    if (!isBn) return category;
    switch (category) {
      case 'All':
        return 'সকল বিভাগ';
      case 'Training':
        return 'ড্রিল ও প্রশিক্ষণ';
      case 'Campus Duty':
        return 'ক্যাম্পাস ডিউটি';
      case 'Camp / Parade':
        return 'ক্যাম্প ও প্যারেড';
      case 'Community Service':
        return 'সামাজিক সেবা';
      default:
        return category;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Optional Top Heading */}
      {showHeading && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
              <CalendarIcon className="w-3.5 h-3.5 text-red-600" />
              <span>{isBn ? 'অফিসিয়াল সময়সূচি' : 'Official Training Schedule'}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isDbSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isDbSynced
                  ? (isBn ? 'ডাটাবেজ সংযুক্ত' : 'Database Synced')
                  : (isBn ? 'লোকাল মোড' : 'Offline Mode')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              {isBn ? 'ইভেন্টস ও ট্রেনিং ক্যালেন্ডার' : 'Official Events & Training Calendar'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {isBn
                ? 'প্লাটুন ড্রিল, রেজিমেন্টাল ক্যাম্প, গার্ড অব অনার এবং সামাজিক সেবামূলক কর্মসূচির সম্পূর্ণ সময়সূচি ফিল্টার করুন।'
                : 'Interactive schedule of platoon morning drills, ceremonial guard of honors, regimental camps, and duty assignments.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Calendar Grid View"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? 'ক্যালেন্ডার ভিউ' : 'Calendar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Agenda List View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? 'লিস্ট ভিউ' : 'Agenda'}</span>
              </button>
            </div>

            {/* Refresh DB button */}
            <button
              type="button"
              onClick={handleRefreshEvents}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-red-700 hover:border-red-300 transition-colors disabled:opacity-50"
              title="Sync from Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Category Filters & Search */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" />
              <span>{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
            </span>

            {categoryOptions.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              const styles = getCategoryStyles(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat !== 'All' && (
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : styles.dot}`}
                    />
                  )}
                  <span>{getCategoryLabel(cat)}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isBn ? toBnNumber(count) : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search in events */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'ইভেন্ট বা স্থান খুঁজুন...' : 'Search training, venue, drill...'}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Summary */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <span>
              {isBn
                ? `${toBnNumber(filteredEvents.length)}টি ইভেন্ট প্রদর্শিত হচ্ছে (${getCategoryLabel(selectedCategory)})`
                : `Showing ${filteredEvents.length} events for "${selectedCategory}" category`}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-red-600 hover:underline font-semibold"
            >
              {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left/Main Column: Interactive Month Grid */}
          <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                    {isBn ? BN_MONTHS[calMonth] : EN_MONTHS[calMonth]} {isBn ? toBnNumber(calYear) : calYear}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {isBn
                      ? `এই মাসে ${toBnNumber(eventsByDate.size)}টি নির্ধারিত দিন`
                      : `${eventsByDate.size} scheduled day(s) active`}
                  </span>
                </div>
              </div>

              {/* Month Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCurrentMonth}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                  title="Jump to current active schedule"
                >
                  {isBn ? 'বর্তমান' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/20 text-center py-2.5 text-[11px] font-mono font-bold uppercase text-slate-500">
              {(isBn ? BN_DAYS : EN_DAYS).map((day, idx) => (
                <div
                  key={idx}
                  className={idx === 5 || idx === 6 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
              {calendarGrid.map((cell, idx) => {
                const dayEvents = eventsByDate.get(cell.dateStr) || [];
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDateStr === cell.dateStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      if (hasEvents && dayEvents[0]) {
                        setActiveEventDetail(dayEvents[0]);
                        if (onSelectEvent) onSelectEvent(dayEvents[0]);
                      }
                    }}
                    className={`min-h-[74px] sm:min-h-[88px] p-1.5 sm:p-2 text-left transition-all relative flex flex-col justify-between ${
                      cell.isCurrentMonth
                        ? 'bg-white dark:bg-slate-900 hover:bg-red-50/40 dark:hover:bg-red-950/20'
                        : 'bg-slate-50/50 dark:bg-slate-950/50 opacity-40 hover:opacity-75'
                    } ${
                      isSelected
                        ? 'ring-2 ring-red-600 ring-inset bg-red-50/60 dark:bg-red-950/40 z-10'
                        : ''
                    }`}
                  >
                    {/* Date Number Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-bold rounded-md px-1.5 py-0.5 ${
                          isSelected
                            ? 'bg-red-700 text-white'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {isBn ? toBnNumber(cell.day) : cell.day}
                      </span>

                      {hasEvents && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-mono font-bold bg-red-600 text-white shrink-0">
                          {isBn ? toBnNumber(dayEvents.length) : dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events inside this cell */}
                    <div className="w-full space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const styles = getCategoryStyles(evt.category);
                        return (
                          <div
                            key={evt.id}
                            className={`truncate rounded px-1 py-0.5 text-[9px] font-medium border flex items-center gap-1 ${styles.bg} ${styles.text} ${styles.border}`}
                            title={`${evt.title} (${evt.time})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-mono text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category Color Legend */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono font-bold uppercase text-slate-500 text-[11px]">
                {isBn ? 'ক্যাটাগরি নির্দেশিকা:' : 'Platoon Category Legend:'}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {['Training', 'Campus Duty', 'Camp / Parade', 'Community Service'].map((cat) => {
                  const styles = getCategoryStyles(cat);
                  return (
                    <div key={cat} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                      <span>{getCategoryLabel(cat)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Date Schedule & Event Details */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {isBn ? 'নির্বাচিত তারিখের সময়সূচি' : 'Daily Training Briefing'}
                  </span>
                  <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white uppercase">
                    {selectedDateStr || 'No date selected'}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedDateEvents.length} {isBn ? 'ইভেন্ট' : 'Events'}
                </span>
              </div>

              {/* List of events on this date */}
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((evt) => {
                    const styles = getCategoryStyles(evt.category);
                    const isCardActive = activeEventDetail?.id === evt.id;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setActiveEventDetail(evt);
                          if (onSelectEvent) onSelectEvent(evt);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isCardActive
                            ? 'border-red-600 ring-2 ring-red-600/20 bg-red-50/30 dark:bg-red-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-950/40'
                        }`}
                      >
                        {/* Event Title & Category */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${styles.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            <span>{isBn && evt.categoryBn ? evt.categoryBn : evt.category}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400">
                            {evt.time}
                          </span>
                        </div>

                        <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1">
                          {isBn && evt.titleBn ? evt.titleBn : evt.title}
                        </h5>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                          {isBn && evt.descriptionBn ? evt.descriptionBn : evt.description}
                        </p>

                        {/* Event Key Meta */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="truncate">{isBn && evt.venueBn ? evt.venueBn : evt.venue}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{isBn && evt.instructorOrLeadBn ? evt.instructorOrLeadBn : evt.instructorOrLead}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate font-mono">{isBn && evt.mandatoryTurnoutBn ? evt.mandatoryTurnoutBn : evt.mandatoryTurnout}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadIcs(evt);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-red-700 transition-colors"
                            title="Download .ICS for Apple/Outlook"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>.ICS</span>
                          </button>

                          <a
                            href={getGoogleCalendarUrl(evt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-red-700 transition-colors"
                            title="Save to Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Google Cal</span>
                          </a>

                          {cadetSession && (
                            <span className="ml-auto text-[10px] font-mono text-emerald-600 font-bold">
                              ✓ Cadet Verified
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isBn ? 'এই তারিখে কোনো নির্ধারিত প্রশিক্ষণ নেই' : 'No drills scheduled on this day'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'ক্যালেন্ডারের লাল দাগ চিহ্নিত দিনগুলো দেখুন।'
                      : 'Click any date highlighted with an event badge to inspect the platoon orders.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateStr('2026-10-14');
                    }}
                    className="mt-2 text-xs font-bold text-red-600 hover:underline"
                  >
                    {isBn ? 'পরবর্তী প্যারেড দেখুন (১৪ অক্টোবর)' : 'View Next Parade (14 October)'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Cadet Guidance Box */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'ক্যাডেট টার্নআউট নির্দেশনা' : 'Cadet Parade Discipline Note'}</span>
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                {isBn
                  ? 'সকল ক্যাডেটকে প্যারেড শুরুর কমপক্ষে ১৫ মিনিট পূর্বে নির্ধারিত কিট (ওয়ার্কিং ড্রেস ও ডিএমএস বুট) পরিধান করে গ্রাউন্ডে উপস্থিত হতে হবে। অনুপস্থিতির ক্ষেত্রে প্লাটুনের সিনিয়র অফিসারের অনুমতি বাধ্যতামূলক।'
                  : 'All cadets must report 15 minutes before the fall-in time in designated uniform. Proper shaving, haircut, and boots polishing are strictly enforced.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL AGENDA LIST */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt) => {
                const styles = getCategoryStyles(evt.category);
                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${styles.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                          <span>{isBn && evt.categoryBn ? evt.categoryBn : evt.category}</span>
                        </span>

                        <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400">
                          {evt.date}
                        </span>
                      </div>

                      <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {isBn && evt.titleBn ? evt.titleBn : evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {isBn && evt.descriptionBn ? evt.descriptionBn : evt.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate">{isBn && evt.venueBn ? evt.venueBn : evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate font-mono">{isBn && evt.mandatoryTurnoutBn ? evt.mandatoryTurnoutBn : evt.mandatoryTurnout}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleDownloadIcs(evt)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>.ICS</span>
                      </button>

                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Cal</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200 uppercase">
                {isBn ? 'কোনো ইভেন্ট পাওয়া যায়নি' : 'No Events Found Matching Filter'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isBn
                  ? 'ফিল্টার পরিবর্তন করে দেখুন অথবা ডাটাবেজ রিফ্রেশ করুন।'
                  : 'Try selecting a different event category or clear your search term.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 transition-colors"
              >
                {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Show All Categories'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
