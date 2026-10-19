import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  Download,
  ExternalLink,
  X,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  UserCheck,
  Users,
  Loader2,
  LogIn,
  LogOut,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  Tag,
  ArrowRight,
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Send,
  Radio,
  Volume2,
  Share2,
} from 'lucide-react';
import { UPCOMING_EVENTS, EventItem } from '../data/siteData';
import {
  subscribeEvents,
  subscribeCadetRsvps,
  toggleEventRsvp,
  RsvpStatus,
} from '../services/portalService';
import {
  getCadetProfile,
  CadetMemberData,
  DEFAULT_CADET_PROFILES,
} from '../services/cadetPortalService';
import {
  EventReminderRecord,
  getStoredReminders,
  saveEventReminder,
  fetchRemoteReminders,
  getPreferredReminderEmail,
  calculateReminderTimes,
  executeTestReminder,
  playAlertChime,
  dispatchWebPush,
  getPushPermissionStatus,
} from '../services/reminderService';
import { EventReminderModal } from '../components/EventReminderModal';
import { EventsCalendar } from '../components/EventsCalendar';
import { SocialShareModal } from '../components/SocialShareModal';
import { ApplyModal } from '../components/ApplyModal';
import {
  subscribeSemesterSettings,
  calculateCountdown,
  SemesterSettings,
  CountdownResult,
} from '../services/semesterRecruitmentService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

// Calendar localization constants
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

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Training':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-600 dark:bg-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      };
    case 'Campus Duty':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-600 dark:bg-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      };
    case 'Camp / Parade':
      return {
        bg: 'bg-red-50 dark:bg-red-950/50',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-600 dark:bg-red-400',
        badge: 'bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
      };
    case 'Community Service':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-600 dark:bg-emerald-400',
        badge: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-900',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800',
        dot: 'bg-slate-600 dark:bg-slate-400',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
      };
  }
};

export const EventsPage: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>(UPCOMING_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // View Mode: 'list' (current cards grid) vs 'calendar' (monthly calendar grid)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  // Current calendar view month (initialized to October 2026, the active operational month)
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 9, 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>('2026-10-14');

  // Cadet Auth & Profile State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [localCadetSession, setLocalCadetSession] = useState<{ email: string; uid: string } | null>(() => {
    const saved = localStorage.getItem('mu_bncc_cadet_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [cadetProfile, setCadetProfile] = useState<CadetMemberData | null>(null);

  // RSVP Status map: eventId -> 'attending' | 'not_attending'
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);
  const [rsvpNotification, setRsvpNotification] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 24-Hour Reminder State & Preferences
  const [reminders, setReminders] = useState<Record<string, EventReminderRecord>>({});
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [preferredEmail, setPreferredEmail] = useState<string>(() =>
    getPreferredReminderEmail('cadet.tanvir@metrouni.edu.bd')
  );
  const [active24hAlertBanner, setActive24hAlertBanner] = useState<EventItem | null>(null);
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);

  // Determine active cadet UID and Email
  const activeUid = currentUser?.uid || localCadetSession?.uid || null;
  const activeEmail = currentUser?.email || localCadetSession?.email || null;
  const isCadetLoggedIn = Boolean(activeUid);
  const isCadetVerified = Boolean(
    cadetProfile?.isVerified ?? (localCadetSession as any)?.isVerified
  );
  const [sharingEvent, setSharingEvent] = useState<EventItem | null>(null);

  // Dynamic Semester Settings & Countdown
  const [semesterSettings, setSemesterSettings] = useState<SemesterSettings | null>(null);
  const [semesterCountdown, setSemesterCountdown] = useState<CountdownResult | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeSemesterSettings((settings) => {
      setSemesterSettings(settings);
      if (settings?.applicationDeadline) {
        setSemesterCountdown(calculateCountdown(settings.applicationDeadline));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!semesterSettings?.applicationDeadline) return;
    const interval = setInterval(() => {
      setSemesterCountdown(calculateCountdown(semesterSettings.applicationDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [semesterSettings?.applicationDeadline]);

  // Subscribe to live events
  useEffect(() => {
    const unsubscribe = subscribeEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      const email = user?.email || localCadetSession?.email;
      const uid = user?.uid || localCadetSession?.uid;
      if (uid && email) {
        try {
          const profile = await getCadetProfile(uid, email);
          setCadetProfile(profile);
          if (email) setPreferredEmail(email);
        } catch (err) {
          console.warn('Could not load cadet profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [localCadetSession]);

  // Subscribe to cadet's real-time RSVPs when logged in
  useEffect(() => {
    if (!activeUid) {
      setRsvps({});
      setReminders({});
      return;
    }

    const unsubscribe = subscribeCadetRsvps(activeUid, (updatedRsvps) => {
      setRsvps(updatedRsvps || {});
    });

    // Load initial local reminders and sync remote
    const cached = getStoredReminders(activeUid);
    setReminders(cached);
    fetchRemoteReminders(activeUid).then((remote) => {
      if (remote) setReminders(remote);
    });

    return () => unsubscribe();
  }, [activeUid]);

  // Background 24-Hour Reminder Engine: Check every 30s for RSVP'd events within 24h
  useEffect(() => {
    if (!activeUid) return;

    const runReminderCheck = () => {
      const attendingEvents = events.filter((e) => rsvps[e.id] === 'attending');

      let currentBannerCandidate: EventItem | null = null;

      attendingEvents.forEach((evt) => {
        const times = calculateReminderTimes(evt.date, evt.time);

        if (times.isWithin24Hours && !times.isPast) {
          if (!currentBannerCandidate) {
            currentBannerCandidate = evt;
          }

          const existingRecord = reminders[evt.id];
          const hasBeenTriggered = existingRecord?.triggered;

          if (!hasBeenTriggered) {
            // Trigger 24h notification
            playAlertChime();
            const channels = existingRecord?.channels || { push: true, email: true };
            const target = existingRecord?.targetEmail || preferredEmail || activeEmail || 'cadet.tanvir@metrouni.edu.bd';

            if (channels.push) {
              dispatchWebPush(
                `🚨 24h Alert: ${evt.title}`,
                `Drill starts tomorrow at ${evt.time}! Mandatory Turnout: ${evt.mandatoryTurnout || 'Working dress'}`
              );
            }

            // Save record as triggered
            saveEventReminder(activeUid, evt, channels, target).then((updated) => {
              updated.triggered = true;
              updated.triggeredAt = new Date().toISOString();
              setReminders((prev) => ({ ...prev, [evt.id]: updated }));
            });
          }
        }
      });

      if (currentBannerCandidate) {
        setActive24hAlertBanner(currentBannerCandidate);
      }
    };

    runReminderCheck();
    const interval = setInterval(runReminderCheck, 30000);
    return () => clearInterval(interval);
  }, [activeUid, events, rsvps, reminders, preferredEmail, activeEmail]);

  // Auto-dismiss notification after 4 seconds
  const showToast = (message: string) => {
    setRsvpNotification(message);
    setTimeout(() => {
      setRsvpNotification(null);
    }, 4000);
  };

  // RSVP Toggle Handler
  const handleToggleRsvp = async (evt: EventItem) => {
    if (!activeUid) {
      setShowLoginPrompt(true);
      return;
    }

    if (!isCadetVerified) {
      showToast(
        isBn
          ? 'আরএসভিপি দিতে অ্যাডমিন ভেরিফিকেশন (isVerified) আবশ্যক।'
          : 'Official administrative verification required to RSVP.'
      );
      return;
    }

    const currentStatus = rsvps[evt.id];
    setTogglingEventId(evt.id);

    try {
      const cadetInfo = {
        name: cadetProfile?.fullName || 'Cadet',
        rank: cadetProfile?.rankAbbr || 'CDT',
      };

      const nextStatus = await toggleEventRsvp(evt.id, activeUid, currentStatus, cadetInfo);

      // Optimistic update
      setRsvps((prev) => ({
        ...prev,
        [evt.id]: nextStatus,
      }));

      const eTitle = isBn ? (evt.titleBn || evt.title) : evt.title;
      if (nextStatus === 'attending') {
        // Automatically schedule 24-Hour Reminder
        const defaultChannels = reminders[evt.id]?.channels || { push: true, email: true };
        const emailToUse = preferredEmail || activeEmail || 'cadet.tanvir@metrouni.edu.bd';
        saveEventReminder(activeUid, evt, defaultChannels, emailToUse).then((saved) => {
          setReminders((prev) => ({ ...prev, [evt.id]: saved }));
        });

        playAlertChime();
        showToast(
          isBn
            ? `উপস্থিতি নিশ্চিত: "${eTitle}" ইভেন্টে আরএসভিপি গৃহীত ও ২৪ ঘণ্টার অ্যালার্ট সক্রিয় করা হয়েছে!`
            : `RSVP Confirmed: Attendance marked for "${evt.title}" & 24h Push/Email alert scheduled!`
        );
      } else {
        showToast(
          isBn
            ? `স্ট্যাটাস আপডেট: "${eTitle}" ইভেন্টে অনুপস্থিত হিসেবে চিহ্নিত করা হয়েছে।`
            : `RSVP Updated: Marked as Not Attending for "${evt.title}".`
        );
      }
    } catch (err) {
      console.error('Failed to toggle RSVP:', err);
      showToast(isBn ? 'আরএসভিপি আপডেট ব্যর্থ হয়েছে।' : 'Failed to update RSVP.');
    } finally {
      setTogglingEventId(null);
    }
  };

  // Quick Test Alert Execution from card
  const handleCardTestAlert = (evt: EventItem) => {
    if (!activeUid) {
      setShowLoginPrompt(true);
      return;
    }
    const currentChannels = reminders[evt.id]?.channels || { push: true, email: true };
    const emailToUse = preferredEmail || activeEmail || 'cadet.tanvir@metrouni.edu.bd';
    const result = executeTestReminder(evt, currentChannels, emailToUse, activeUid);

    showToast(
      isBn
        ? `"${evt.title}" এর জন্য ২৪ ঘণ্টার টেস্ট অ্যালার্ট প্রেরণ করা হয়েছে (${result.pushSent ? 'পুশ' : ''} ${result.emailSent ? 'ইমেইল' : ''})`
        : `Dispatched 24-hour test alert for "${evt.title}" via ${result.pushSent ? 'Push & ' : ''}Email!`
    );
  };



  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('mu_bncc_cadet_session');
    setLocalCadetSession(null);
    setCurrentUser(null);
    setCadetProfile(null);
    setRsvps({});
    showToast(isBn ? 'ক্যাডেট লগআউট সম্পন্ন।' : 'Cadet session ended.');
  };

  const categories = ['All', 'Training', 'Campus Duty', 'Camp / Parade', 'Community Service'];

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const rsvpAttendingEvents = events.filter((e) => rsvps[e.id] === 'attending');

  // Download .ics calendar file
  const handleAddToCalendar = (evt: EventItem) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Metropolitan University//MU BNCC Portal//EN',
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

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id}-mu-bncc.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (evt: EventItem) => {
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(
      `${evt.description}\n\nMandatory Turnout: ${evt.mandatoryTurnout}\nLead: ${evt.instructorOrLead}`
    );
    const location = encodeURIComponent(evt.venue);
    const dateFormatted = evt.date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T004500Z/${dateFormatted}T030000Z`;
  };

  // Calendar View Matrix & Navigation Calculation
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sunday
  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = calMonth === 0 ? 11 : calMonth - 1;
    const prevY = calMonth === 0 ? calYear - 1 : calYear;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Leading days from next month to complete rows of 7
  const remainingCells = calendarCells.length % 7 === 0 ? 0 : 7 - (calendarCells.length % 7);
  for (let d = 1; d <= remainingCells; d++) {
    const nextM = calMonth === 11 ? 0 : calMonth + 1;
    const nextY = calMonth === 11 ? calYear + 1 : calYear;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Events in currently active calendar month (filtered by category & search)
  const currentMonthEvents = filteredEvents.filter((evt) => {
    if (!evt.date) return false;
    const parts = evt.date.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return y === calYear && m === calMonth + 1;
  });

  // Events on selected day
  const selectedDateEvents = selectedCalendarDate
    ? filteredEvents.filter((evt) => evt.date === selectedCalendarDate)
    : [];

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedCalendarDate(null);
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedCalendarDate(null);
  };

  const handleTodayMonth = () => {
    setCalendarDate(new Date(2026, 9, 1)); // Active operational semester month (October 2026)
    setSelectedCalendarDate('2026-10-14');
  };

  return (
    <div className="space-y-16 pb-20">
      <SEOHead
        title="Upcoming Events & Parades | Operational Calendar"
        titleBn="আসন্ন ইভেন্ট ও প্যারেড | অপারেশনাল ক্যালেন্ডার"
        description="Official parade and training calendar for MU BNCC Platoon. Track bi-weekly morning drills, regimental camps, ceremonial parades, and campus duties."
        descriptionBn="এমইউ বিএনসিসি প্লাটুনের অফিসিয়াল প্যারেড ও প্রশিক্ষণ সময়সূচি। দ্বি-সাপ্তাহিক সকালের ড্রিল, ক্যাম্প এবং গার্ড অব অনার কার্যতালিকা।"
        path="/events"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'MU BNCC Platoon Upcoming Parades & Events',
          itemListElement: events.slice(0, 5).map((evt, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Event',
              name: evt.title,
              startDate: evt.date,
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              location: {
                '@type': 'Place',
                name: evt.venue,
                address: 'Metropolitan University Campus, Bateshwar, Sylhet',
              },
              description: evt.description,
            },
          })),
        }}
      />

      {/* Floating RSVP Toast Notification */}
      {rsvpNotification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-sm border border-slate-700 dark:border-slate-200 text-xs sm:text-sm font-medium backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{rsvpNotification}</span>
            <button
              onClick={() => setRsvpNotification(null)}
              className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            <span>Operational Calendar 2026</span>
            <span className="text-slate-400">·</span>
            <span>Sylhet Battalion</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            {t('events.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? 'বিশ্ববিদ্যালয়ের সকালের ড্রিল সেশন, রেজিমেন্টাল ক্যাম্প, গার্ড অফ অনার এবং সামাজিক স্বেচ্ছাসেবামূলক কাজের সাথে সার্বক্ষণিক আপডেট থাকুন।'
              : 'Stay synchronized with university morning drill sessions, regimental camps, ceremonial guards of honor, and community service deployments.'}
          </p>

          {/* Cadet RSVP Context Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            {isCadetLoggedIn ? (
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {isBn ? 'লগইন আছেন:' : 'Logged in as:'}{' '}
                    <strong className="underline underline-offset-2">
                      {cadetProfile?.fullName || 'Active Cadet'}
                    </strong>{' '}
                    ({cadetProfile?.rankAbbr || 'CDT'})
                  </span>
                </div>
                <span className="hidden sm:inline text-emerald-300 dark:text-emerald-700">|</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  {isBn
                    ? 'নিচে যেকোনো ইভেন্টে আরএসভিপি টগল করে আপনার অংশগ্রহণ নিশ্চিত করুন।'
                    : 'Toggle the RSVP button on any event below to confirm your participation.'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 dark:hover:text-red-400 ml-1 transition-colors"
                  title="Logout Cadet Session"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{isBn ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>
                  {isBn
                    ? 'প্লাটুন ক্যাডেটদের ইভেন্ট অংশগ্রহণের আরএসভিপি নিশ্চিত করতে লগইন প্রয়োজন।'
                    : 'Platoon cadets can confirm event participation using the event RSVP toggle.'}
                </span>
                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ক্যাডেট পোর্টাল' : 'Cadet Portal'}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 sm:space-y-12">
        {/* Active 24-Hour Urgent Operational Alert Banner */}
        {active24hAlertBanner && !alertBannerDismissed && (
          <div className="rounded-2xl border border-red-300 dark:border-red-800/80 bg-gradient-to-r from-red-600 via-red-700 to-amber-700 text-white p-4 sm:p-5 shadow-sm animate-fadeIn flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white/20 rounded-xl text-white shrink-0 mt-0.5 shadow-inner">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono bg-white/20 px-2 py-0.5 rounded text-white border border-white/20">
                    24-Hour Operational Alert
                  </span>
                  <span className="text-xs text-amber-200 font-mono font-semibold">
                    Starts in &lt;24 hours!
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isBn ? active24hAlertBanner.titleBn || active24hAlertBanner.title : active24hAlertBanner.title}
                </h3>
                <p className="text-xs text-red-100 flex flex-wrap items-center gap-x-2">
                  <span>📅 {active24hAlertBanner.displayDate}</span>
                  <span>•</span>
                  <span>⏰ {active24hAlertBanner.time}</span>
                  <span>•</span>
                  <span>📍 {active24hAlertBanner.venue}</span>
                </p>
                <div className="text-xs font-semibold text-amber-200 pt-0.5">
                  {isBn ? 'বাধ্যতামূলক টার্নআউট ও কিট:' : 'Mandatory Turnout:'}{' '}
                  <span className="text-white underline underline-offset-2">
                    {active24hAlertBanner.mandatoryTurnout}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleCardTestAlert(active24hAlertBanner)}
                className="px-3 py-1.5 rounded-lg bg-white text-red-800 hover:bg-red-50 text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                title="Play chime and test alert"
              >
                <Volume2 className="w-3.5 h-3.5 text-red-600" />
                <span>{isBn ? 'টেস্ট অ্যালার্ট' : 'Trigger Alert'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalEvent(active24hAlertBanner)}
                className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-white text-xs font-semibold border border-white/20 transition-colors"
              >
                {isBn ? 'নির্দেশনা দেখুন' : 'View Directives'}
              </button>
              <button
                type="button"
                onClick={() => setAlertBannerDismissed(true)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Semester Countdown Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/40 p-6 sm:p-8 text-white shadow-sm">
          {/* Subtle military grid background decoration */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 border border-red-500/40 px-3 py-0.5 text-[11px] font-mono font-bold uppercase tracking-widest text-red-300">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {isBn ? 'সেমিস্টার রিক্রুটমেন্ট ও সময়সীমা' : 'Active Semester & Recruitment'}
                </span>

                <span className="text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  {semesterSettings?.currentSemester || 'Fall 2026'}
                </span>
              </div>

              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                  {isBn
                    ? `${semesterSettings?.currentSemesterBn || semesterSettings?.currentSemester || 'ফল ২০২৬'} সেমিস্টার কাউন্টডাউন`
                    : `${semesterSettings?.currentSemester || 'Fall 2026'} Semester Countdown`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {isBn
                    ? `অ্যাডমিন নির্ধারিত আবেদন সময়সীমা: ${
                        semesterSettings?.applicationDeadline
                          ? new Date(semesterSettings.applicationDeadline).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '৩০ নভেম্বর ২০২৬'
                      }। নতুন ক্যাডেট প্রার্থীদের তথ্য সরাসরি গুগল শিটে সেমিস্টার অনুযায়ী সংরক্ষিত হচ্ছে।`
                    : `Application deadline set by battalion leadership: ${
                        semesterSettings?.applicationDeadline
                          ? new Date(semesterSettings.applicationDeadline).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'November 30, 2026'
                      }. All applicant dossiers and verified cadets are tracked under this active cycle.`}
                </p>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isBn
                      ? `${semesterSettings?.currentSemesterBn || semesterSettings?.currentSemester || 'ফল ২০২৬'}-এ যোগ দিন`
                      : `Apply for ${semesterSettings?.currentSemester || 'Fall 2026'}`}
                  </span>
                </button>

                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>
                    {semesterCountdown?.isExpired
                      ? (isBn ? 'আবেদনের সময়সীমা সমাপ্ত' : 'Intake Window Closed')
                      : (isBn ? 'অনলাইন আবেদন উন্মুক্ত' : 'Online Applications Open')}
                  </span>
                </div>
              </div>
            </div>

            {/* Countdown Metrics Matrix */}
            <div className="shrink-0 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="text-center pb-2.5 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  {isBn ? 'বর্তমান সেমিস্টারে অবশিষ্ট সময়' : 'Days Remaining in Current Semester'}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-red-500 tracking-tight mt-0.5">
                  {semesterCountdown ? (
                    isBn ? toBnNumber(semesterCountdown.days) : semesterCountdown.days
                  ) : (
                    '46'
                  )}{' '}
                  <span className="text-xs uppercase font-sans font-bold text-slate-300">
                    {isBn ? 'দিন অবশিষ্ট' : 'Days Left'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center pt-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[54px]">
                  <span className="font-mono text-lg sm:text-xl font-bold text-white block">
                    {semesterCountdown ? (isBn ? toBnNumber(semesterCountdown.days) : semesterCountdown.days) : '46'}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {isBn ? 'দিন' : 'Days'}
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[54px]">
                  <span className="font-mono text-lg sm:text-xl font-bold text-amber-400 block">
                    {semesterCountdown
                      ? isBn
                        ? toBnNumber(String(semesterCountdown.hours).padStart(2, '0'))
                        : String(semesterCountdown.hours).padStart(2, '0')
                      : '14'}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {isBn ? 'ঘণ্টা' : 'Hours'}
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[54px]">
                  <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400 block">
                    {semesterCountdown
                      ? isBn
                        ? toBnNumber(String(semesterCountdown.minutes).padStart(2, '0'))
                        : String(semesterCountdown.minutes).padStart(2, '0')
                      : '32'}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {isBn ? 'মিনিট' : 'Mins'}
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[54px]">
                  <span className="font-mono text-lg sm:text-xl font-bold text-rose-400 block">
                    {semesterCountdown
                      ? isBn
                        ? toBnNumber(String(semesterCountdown.seconds).padStart(2, '0'))
                        : String(semesterCountdown.seconds).padStart(2, '0')
                      : '08'}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {isBn ? 'সেকেন্ড' : 'Secs'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Filter Tabs, Search & Layout View Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Category Filter Buttons (Functional Tabs) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full lg:w-auto overflow-x-auto">
            {categories.map((cat) => {
              let label = cat;
              if (isBn) {
                if (cat === 'All') label = 'সকল';
                else if (cat === 'Training') label = 'ড্রিল ও প্রশিক্ষণ';
                else if (cat === 'Campus Duty') label = 'ক্যাম্পাস ডিউটি';
                else if (cat === 'Camp / Parade') label = 'ক্যাম্প ও কুচকাওয়াজ';
                else if (cat === 'Community Service') label = 'সামাজিক সেবা';
              }
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search query box */}
            <div className="w-full sm:w-56">
              <input
                type="text"
                placeholder={isBn ? 'ইভেন্ট বা স্থান খুঁজুন...' : 'Search event name or venue...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* 24-Hour Reminder Alert Center Trigger Button */}
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border shrink-0 ${
                rsvpAttendingEvents.length > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={t('events.reminderBtn')}
            >
              <div className="relative">
                <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {rsvpAttendingEvents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span>{isBn ? '২৪ঘণ্টা অ্যালার্ট' : '24h Alerts'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-800 text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-100">
                {rsvpAttendingEvents.length}
              </span>
            </button>

            {/* Layout View Toggle (List vs Monthly Calendar) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
                title={t('events.viewList')}
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-3.5 h-3.5" />
                <span>{t('events.viewList')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
                title={t('events.viewCalendar')}
                aria-pressed={viewMode === 'calendar'}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{t('events.viewCalendar')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Switching: Calendar Grid vs List Layout */}
        {viewMode === 'calendar' ? (
          <EventsCalendar
            initialCategory={selectedCategory}
            onSelectEvent={(evt) => setActiveModalEvent(evt)}
            showHeading={false}
            cadetSession={
              cadetProfile
                ? {
                    cadetId: cadetProfile.cadetId,
                    fullName: cadetProfile.fullName,
                    rank: cadetProfile.currentRank,
                  }
                : null
            }
          />
        ) : (
          /* Events List Grid (Standard List Layout) */
          filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const eTitle = isBn ? (evt.titleBn || evt.title) : evt.title;
                const eCat = isBn ? (evt.categoryBn || evt.category) : evt.category;
                const eDisplayDate = isBn ? (evt.displayDateBn || evt.displayDate) : evt.displayDate;
                const eDesc = isBn ? (evt.descriptionBn || evt.description) : evt.description;
                const eTime = isBn ? (evt.timeBn || evt.time) : evt.time;
                const eVenue = isBn ? (evt.venueBn || evt.venue) : evt.venue;

                const cadetRsvpStatus = rsvps[evt.id];
                const isAttending = cadetRsvpStatus === 'attending';
                const isNotAttending = cadetRsvpStatus === 'not_attending';
                const isTogglingThis = togglingEventId === evt.id;

                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Category and Date indicator */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-bold uppercase text-red-600 dark:text-red-400">
                          {eCat}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {eDisplayDate}
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
                        {eTitle}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {eDesc}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{eTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{eVenue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Minimal Simplified One-Tap RSVP Interaction & Content Share */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        {isCadetLoggedIn ? (
                          isCadetVerified ? (
                            <button
                              type="button"
                              onClick={() => handleToggleRsvp(evt)}
                              disabled={isTogglingThis}
                              className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                                isAttending
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300'
                              }`}
                              title={
                                isAttending
                                  ? isBn
                                    ? 'উপস্থিতি প্রত্যাহার করতে ট্যাপ করুন'
                                    : 'Click to cancel attendance'
                                  : isBn
                                  ? 'উপস্থিতি নিশ্চিত করতে এক-ট্যাপ করুন'
                                  : 'One-tap to mark as Attending / Participated'
                              }
                            >
                              {isTogglingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isAttending ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : (
                                <PlusCircle className="w-4 h-4 text-emerald-600" />
                              )}
                              <span className="truncate">
                                {isAttending
                                  ? isBn
                                    ? 'উপস্থিত / অংশগ্রহণকারী'
                                    : 'Attending / Participated'
                                  : isBn
                                  ? 'উপস্থিতি দিন'
                                  : 'Mark Attending'}
                              </span>
                            </button>
                          ) : (
                            <div
                              className="py-2 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center text-[11px] font-mono font-semibold text-amber-800 dark:text-amber-300 truncate"
                              title={isBn ? 'অ্যাডমিন ভেরিফিকেশন অপেক্ষারত' : 'Pending administrative verification'}
                            >
                              {isBn ? 'ভেরিফিকেশন অপেক্ষারত' : 'Verification Pending'}
                            </div>
                          )
                        ) : (
                          <Link
                            to="/dashboard"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors truncate"
                          >
                            <LogIn className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            <span className="truncate">{isBn ? 'লগইন করে আরএসভিপি' : 'Sign In to RSVP'}</span>
                          </Link>
                        )}
                      </div>

                      {/* One-click Content Share to Social Media */}
                      <button
                        type="button"
                        onClick={() => setSharingEvent(evt)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors shrink-0 shadow-2xs"
                        title={isBn ? 'ইভেন্ট সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share event to social media'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions (View Details & Calendar Export) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModalEvent(evt)}
                        className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddToCalendar(evt)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Download iCal file"
                          aria-label="Download iCal"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <a
                          href={getGoogleCalendarUrl(evt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Add to Google Calendar"
                          aria-label="Add to Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {isBn
                  ? `"${selectedCategory}" ক্যাটাগরিতে কোনো অপারেশনাল ইভেন্ট পাওয়া যায়নি।`
                  : `No operational events found matching category "${selectedCategory}".`}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider underline"
              >
                {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
              </button>
            </div>
          )
        )}
      </div>

      {/* Event Details Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-5 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-red-600 dark:text-red-400">
                  {isBn
                    ? `${activeModalEvent.categoryBn || activeModalEvent.category} · অফিসিয়াল নির্দেশনা`
                    : `${activeModalEvent.category} · Official Directive`}
                </span>
                <h3 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white mt-1">
                  {isBn ? (activeModalEvent.titleBn || activeModalEvent.title) : activeModalEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {isBn ? (activeModalEvent.descriptionBn || activeModalEvent.description) : activeModalEvent.description}
              </p>

              {/* Event Metadata */}
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isBn ? 'তারিখ:' : 'Date:'}
                  </span>
                  <span className="font-mono">
                    {isBn ? (activeModalEvent.displayDateBn || activeModalEvent.displayDate) : activeModalEvent.displayDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isBn ? 'সময়:' : 'Timing:'}
                  </span>
                  <span className="font-mono">
                    {isBn ? (activeModalEvent.timeBn || activeModalEvent.time) : activeModalEvent.time}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isBn ? 'স্থান:' : 'Venue:'}
                  </span>
                  <span>
                    {isBn ? (activeModalEvent.venueBn || activeModalEvent.venue) : activeModalEvent.venue}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isBn ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা:' : 'Officer / Lead:'}
                  </span>
                  <span>
                    {isBn ? (activeModalEvent.instructorOrLeadBn || activeModalEvent.instructorOrLead) : activeModalEvent.instructorOrLead}
                  </span>
                </div>
              </div>

              {/* Turnout Requirement */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300">
                <span className="font-bold uppercase font-mono text-[11px] block">
                  {isBn ? 'বাধ্যতামূলক ক্যাডেট টার্নআউট ও ইউনিফর্ম:' : 'Mandatory Cadet Turnout:'}
                </span>
                <span className="mt-0.5 block">
                  {isBn ? (activeModalEvent.mandatoryTurnoutBn || activeModalEvent.mandatoryTurnout) : activeModalEvent.mandatoryTurnout}
                </span>
              </div>

              {/* Modal RSVP Card */}
              {/* Simplified Minimal One-Tap RSVP Interaction & Content Share */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-heading font-bold uppercase tracking-wider text-slate-900 dark:text-white text-xs">
                      {isBn ? 'আপনার উপস্থিতি আরএসভিপি' : 'Your Attendance RSVP'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSharingEvent(activeModalEvent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'শেয়ার' : 'Share'}</span>
                  </button>
                </div>

                {isCadetLoggedIn ? (
                  isCadetVerified ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRsvp(activeModalEvent)}
                        disabled={togglingEventId === activeModalEvent.id}
                        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                          rsvps[activeModalEvent.id] === 'attending'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {togglingEventId === activeModalEvent.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : rsvps[activeModalEvent.id] === 'attending' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {rsvps[activeModalEvent.id] === 'attending'
                            ? isBn
                              ? '✓ উপস্থিত / অংশগ্রহণ নিশ্চিত (ট্যাপ করে প্রত্যাহার করুন)'
                              : '✓ Attending / Participated (Tap to toggle)'
                            : isBn
                            ? 'উপস্থিত হিসেবে চিহ্নিত করুন (One-Tap RSVP)'
                            : 'One-Tap: Mark as Attending / Participated'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center text-xs font-mono font-semibold text-amber-800 dark:text-amber-300">
                      {isBn ? 'অ্যাডমিন ভেরিফিকেশন অপেক্ষারত (আরএসভিপি সাময়িক লক)' : 'Pending administrative verification (RSVP locked)'}
                    </div>
                  )
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isBn
                        ? 'এই ইভেন্টে আরএসভিপি নিশ্চিত করতে অনুগ্রহ করে ক্যাডেট পোর্টালে লগইন করুন।'
                        : 'Please log in as a member cadet to confirm your attendance.'}
                    </p>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ক্যাডেট পোর্টালে লগইন করুন' : 'Sign in to Cadet Portal'}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 24-Hour Reminder Directive Card inside Modal */}
              {isCadetLoggedIn && rsvps[activeModalEvent.id] === 'attending' && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-900/10 dark:bg-emerald-950/40 p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      <span className="font-heading font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 text-xs">
                        {isBn ? 'স্বয়ংক্রিয় ২৪ ঘণ্টা পূর্ববর্তী সতর্কতা' : 'Automated 24-Hour Reminder Alert'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700 dark:text-slate-300">
                      <span>{isBn ? 'অ্যালার্ট প্রেরণের নির্ধারিত সময়:' : 'Alert Dispatch Trigger:'}</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {calculateReminderTimes(activeModalEvent.date, activeModalEvent.time).reminderTriggerTime.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{isBn ? 'সক্রিয় চ্যানেলসমূহ:' : 'Active Delivery Channels:'}</span>
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Push Alert</span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">✓ Email Digest ({preferredEmail})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCardTestAlert(activeModalEvent)}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBn ? 'টেস্ট অ্যালার্ট পাঠান' : 'Dispatch Test Alert Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsReminderModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isBn ? 'অ্যালার্ট কনফিগারেশন' : 'Manage Alerts'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAddToCalendar(activeModalEvent)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'ক্যালেন্ডারে সংরক্ষণ (.ics)' : 'Save to Calendar (.ics)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalEvent(null)}
                className="rounded-lg bg-slate-900 dark:bg-slate-800 text-white px-5 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Reminder Management Modal */}
      <EventReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        rsvpEvents={rsvpAttendingEvents}
        reminders={reminders}
        onUpdateReminder={(eventId, record) => {
          setReminders((prev) => ({ ...prev, [eventId]: record }));
        }}
        cadetUid={activeUid || 'guest-cadet'}
        defaultEmail={preferredEmail}
      />

      {/* Social Media Content Share Modal */}
      {sharingEvent && (
        <SocialShareModal
          isOpen={Boolean(sharingEvent)}
          onClose={() => setSharingEvent(null)}
          title={`${sharingEvent.title} | Metropolitan University BNCC Platoon Event`}
          url={window.location.href}
          summary={sharingEvent.description}
        />
      )}

      {/* Recruit Application Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
