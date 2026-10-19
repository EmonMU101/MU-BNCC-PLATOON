import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Shield,
  HeartHandshake,
  Clock,
  Flame,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Plus,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  UserCheck,
} from 'lucide-react';
import {
  CadetMemberData,
  subscribeLeaderboardCadets,
  getLeaderboardCadets,
  logCadetCommunityService,
  logCadetTrainingHours,
  calculateMeritScore,
} from '../services/cadetPortalService';

interface CadetLeaderboardProps {
  currentCadet?: CadetMemberData | null;
  onCadetUpdated?: (updated: CadetMemberData) => void;
  className?: string;
}

type SortMetric = 'merit' | 'training' | 'community';

export const CadetLeaderboard: React.FC<CadetLeaderboardProps> = ({
  currentCadet,
  onCadetUpdated,
  className = '',
}) => {
  const [cadets, setCadets] = useState<CadetMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMetric, setSortMetric] = useState<SortMetric>('merit');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logType, setLogType] = useState<'community' | 'training'>('community');
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // Form state for logging hours
  const [logFormData, setLogFormData] = useState({
    title: '',
    category: 'Disaster Relief',
    hours: 6,
    date: new Date().toISOString().split('T')[0],
    verifiedBy: 'PUO Abu Yusuf Musa',
  });

  // Fetch and subscribe to live Firestore leaderboard
  useEffect(() => {
    setLoading(true);
    getLeaderboardCadets().then((initialCadets) => {
      setCadets(initialCadets);
      setLoading(false);
    });

    const unsubscribe = subscribeLeaderboardCadets((updatedCadets) => {
      setCadets(updatedCadets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const refreshed = await getLeaderboardCadets();
      setCadets(refreshed);
    } catch (e) {
      console.warn('Manual refresh error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort cadets
  const processedCadets = useMemo(() => {
    let list = [...cadets];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          (c.cadetNumber || c.cadetId || '').toLowerCase().includes(query) ||
          (c.department || '').toLowerCase().includes(query) ||
          (c.rank || c.currentRank || '').toLowerCase().includes(query)
      );
    }

    // Platoon section filter
    if (sectionFilter !== 'All') {
      if (sectionFilter === 'Female Wing') {
        list = list.filter((c) => (c.platoonSection || '').toLowerCase().includes('female'));
      } else if (sectionFilter === 'Platoon 1') {
        list = list.filter(
          (c) =>
            (c.platoonSection || '').toLowerCase().includes('platoon 1') &&
            !(c.platoonSection || '').toLowerCase().includes('female')
        );
      } else if (sectionFilter === 'Platoon 2') {
        list = list.filter((c) => (c.platoonSection || '').toLowerCase().includes('platoon 2'));
      }
    }

    // Sort by chosen metric
    list.sort((a, b) => {
      if (sortMetric === 'training') {
        return (b.trainingHours || 0) - (a.trainingHours || 0);
      }
      if (sortMetric === 'community') {
        return (b.communityServiceHours || 0) - (a.communityServiceHours || 0);
      }
      // default: composite merit score
      const scoreA =
        a.meritScore ||
        calculateMeritScore(a.trainingHours, a.communityServiceHours, a.attendanceRate);
      const scoreB =
        b.meritScore ||
        calculateMeritScore(b.trainingHours, b.communityServiceHours, b.attendanceRate);
      return scoreB - scoreA;
    });

    return list;
  }, [cadets, searchQuery, sectionFilter, sortMetric]);

  // Determine current user's standing on leaderboard
  const currentUserRankIndex = useMemo(() => {
    if (!currentCadet) return -1;
    return processedCadets.findIndex(
      (c) =>
        c.uid === currentCadet.uid ||
        c.email.toLowerCase() === currentCadet.email.toLowerCase()
    );
  }, [processedCadets, currentCadet]);

  const topThree = useMemo(() => {
    return processedCadets.slice(0, 3);
  }, [processedCadets]);

  // Handle logging new hours
  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCadet) return;
    setSubmittingLog(true);

    try {
      let updated: CadetMemberData;
      if (logType === 'community') {
        updated = await logCadetCommunityService(
          currentCadet.uid,
          {
            title: logFormData.title.trim() || 'Voluntary Community Service Mission',
            category: logFormData.category,
            hours: Number(logFormData.hours) || 4,
            date: logFormData.date,
            verifiedBy: logFormData.verifiedBy,
          },
          currentCadet
        );
      } else {
        updated = await logCadetTrainingHours(
          currentCadet.uid,
          logFormData.title.trim() || 'Tactical Drill & Maneuver Practice',
          Number(logFormData.hours) || 4,
          logFormData.category,
          currentCadet
        );
      }

      if (onCadetUpdated) {
        onCadetUpdated(updated);
      }

      setLogSuccessMsg(
        `Successfully logged ${logFormData.hours} ${
          logType === 'community' ? 'community service' : 'tactical training'
        } hours. Your merit score has been updated in Firestore!`
      );
      setIsLogModalOpen(false);

      // Reset form
      setLogFormData({
        title: '',
        category: 'Disaster Relief',
        hours: 6,
        date: new Date().toISOString().split('T')[0],
        verifiedBy: 'PUO Abu Yusuf Musa',
      });

      // Refresh list
      const refreshed = await getLeaderboardCadets();
      setCadets(refreshed);

      setTimeout(() => setLogSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to log hours:', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-700/80 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-white shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                Platoon Order of Merit
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Firestore Synced
              </span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Cadet Merit & Service Leaderboard
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Recognizing the vanguard of Metropolitan University BNCC Platoon. Standings are dynamically computed from tactical training drill hours, voluntary civic missions (flood relief, blood donation, medical triage), and parade discipline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {currentCadet && (
              <button
                type="button"
                onClick={() => {
                  setLogType('community');
                  setIsLogModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Log Service / Drill Hours</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 text-xs font-semibold backdrop-blur-xs transition-colors"
              title="Refresh from cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>
          </div>
        </div>

        {/* Dynamic Formula Legend */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Training Drill: <strong>1.5 pts / hour</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Community Service: <strong>2.0 pts / hour</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Parade Attendance: <strong>0.5 pts / % turnout</strong></span>
          </div>
        </div>
      </div>

      {logSuccessMsg && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{logSuccessMsg}</span>
        </div>
      )}

      {/* "Your Platoon Standing" Card (When Cadet is Logged in) */}
      {currentCadet && (
        <div className="rounded-2xl border-2 border-red-500/40 dark:border-red-500/30 bg-gradient-to-r from-red-50/60 via-white to-amber-50/60 dark:from-red-950/30 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-700 text-white flex flex-col items-center justify-center font-mono shadow-md shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider">RANK</span>
              <span className="text-xl font-extrabold leading-none">
                {currentUserRankIndex >= 0 ? `#${currentUserRankIndex + 1}` : '—'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 uppercase">
                  Your Current Platoon Standing
                </span>
                <span className="rounded bg-red-100 dark:bg-red-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-red-800 dark:text-red-300">
                  {currentCadet.rankAbbr || 'CDT'}
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                {currentCadet.fullName} · {currentCadet.cadetNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                {currentCadet.platoonSection} · {currentCadet.department}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Merit Score</span>
              <span className="text-base font-mono font-extrabold text-red-700 dark:text-red-400">
                {currentCadet.meritScore || calculateMeritScore(currentCadet.trainingHours, currentCadet.communityServiceHours, currentCadet.attendanceRate)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Drill Hours</span>
              <span className="text-base font-mono font-extrabold text-slate-800 dark:text-slate-200">
                {currentCadet.trainingHours || 0} hrs
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Civic Service</span>
              <span className="text-base font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                {currentCadet.communityServiceHours || 0} hrs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hall of Honor: Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Regimental Vanguard
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white">
                Hall of Honor · Top 3 Performers
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Updated Live from Cloud
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 text-slate-400" />
                <span>#2 Silver Merit</span>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-slate-900 flex items-center justify-center font-mono font-extrabold text-lg shadow">
                  2
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {(topThree[1].rank || topThree[1].currentRank)} ({topThree[1].rankAbbr || topThree[1].currentRank})
                  </span>
                  <h4 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {topThree[1].fullName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
                    {topThree[1].department}
                  </p>
                </div>

                {topThree[1].distinctionBadge && (
                  <div className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {topThree[1].distinctionBadge}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1 text-center font-mono">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Drill</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{topThree[1].trainingHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Civic</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{topThree[1].communityServiceHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Merit</span>
                  <span className="text-xs font-extrabold text-red-700 dark:text-red-400">{topThree[1].meritScore}</span>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold - Centerpiece Elevated) */}
            <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400 dark:border-amber-500/60 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-6 shadow-md md:-translate-y-2 flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3.5 py-1 rounded-bl-xl text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                <span>#1 Gold Laureate</span>
              </div>

              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-amber-950 flex items-center justify-center font-mono font-extrabold text-2xl shadow-lg border-2 border-white/40">
                  1
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {(topThree[0].rank || topThree[0].currentRank)} ({topThree[0].rankAbbr || topThree[0].currentRank})
                  </span>
                  <h4 className="font-heading text-2xl font-black uppercase text-slate-900 dark:text-white">
                    {topThree[0].fullName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
                    {topThree[0].department}
                  </p>
                </div>

                {topThree[0].distinctionBadge && (
                  <div className="inline-block rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2.5 py-1 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300">
                    {topThree[0].distinctionBadge}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-amber-200 dark:border-slate-800 grid grid-cols-3 gap-1 text-center font-mono">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Drill</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{topThree[0].trainingHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Civic</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{topThree[0].communityServiceHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Merit</span>
                  <span className="text-sm font-black text-red-700 dark:text-red-400">{topThree[0].meritScore} pts</span>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 rounded-2xl border-2 border-amber-700/30 dark:border-amber-800/40 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-800/10 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border-l border-b border-amber-700/20">
                <Medal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                <span>#3 Bronze Merit</span>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 flex items-center justify-center font-mono font-extrabold text-lg shadow">
                  3
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {(topThree[2].rank || topThree[2].currentRank)} ({topThree[2].rankAbbr || topThree[2].currentRank})
                  </span>
                  <h4 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    {topThree[2].fullName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
                    {topThree[2].department}
                  </p>
                </div>

                {topThree[2].distinctionBadge && (
                  <div className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {topThree[2].distinctionBadge}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1 text-center font-mono">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Drill</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{topThree[2].trainingHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Civic</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{topThree[2].communityServiceHours}h</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Merit</span>
                  <span className="text-xs font-extrabold text-red-700 dark:text-red-400">{topThree[2].meritScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Filters & Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Metric Sort Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setSortMetric('merit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                sortMetric === 'merit'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              Overall Merit Score
            </button>
            <button
              type="button"
              onClick={() => setSortMetric('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                sortMetric === 'training'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              Training Drill Hours
            </button>
            <button
              type="button"
              onClick={() => setSortMetric('community')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                sortMetric === 'community'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              Community Service
            </button>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">Section:</span>
            {['All', 'Platoon 1', 'Platoon 2', 'Female Wing'].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectionFilter(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sectionFilter === sec
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by cadet name, cadet number (e.g. MU-BNCC-2024-001), or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Showing {processedCadets.length} Platoon Cadets</span>
          <span>Ranked by: {sortMetric.toUpperCase()}</span>
        </div>

        {processedCadets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No cadets found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Cadet Profile</th>
                  <th className="py-3 px-4">Section / Wing</th>
                  <th className="py-3 px-4 text-center">Training Hours</th>
                  <th className="py-3 px-4 text-center">Civic Service</th>
                  <th className="py-3 px-4 text-right">Merit Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedCadets.map((cadet, index) => {
                  const isCurrent =
                    currentCadet &&
                    (cadet.uid === currentCadet.uid ||
                      cadet.email.toLowerCase() === currentCadet.email.toLowerCase());
                  const rankNumber = index + 1;

                  return (
                    <tr
                      key={cadet.uid}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrent
                          ? 'bg-red-50/70 dark:bg-red-950/20 font-medium'
                          : ''
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {rankNumber === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-amber-950 text-xs shadow-xs">
                            🥇
                          </span>
                        ) : rankNumber === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 text-slate-800 text-xs shadow-xs">
                            🥈
                          </span>
                        ) : rankNumber === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700 text-amber-100 text-xs shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">#{rankNumber}</span>
                        )}
                      </td>

                      {/* Cadet Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 text-white flex flex-col items-center justify-center font-mono font-bold text-[10px] shrink-0 border border-slate-700">
                            <span className="text-red-400">{cadet.rankAbbr || 'CDT'}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold uppercase text-slate-900 dark:text-white text-sm">
                                {cadet.fullName}
                              </span>
                              {isCurrent && (
                                <span className="rounded bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.2 uppercase font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="font-mono text-red-600 dark:text-red-400">
                                {cadet.cadetNumber}
                              </span>
                              <span>·</span>
                              <span className="truncate">{cadet.department}</span>
                            </div>
                            {cadet.distinctionBadge && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                                ★ {cadet.distinctionBadge}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Section */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-sans text-xs">
                        {cadet.platoonSection}
                      </td>

                      {/* Training Hours */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {cadet.trainingHours || 0} hrs
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cadet.modules?.filter((m) => m.completed).length || 6} drills
                          </span>
                        </div>
                      </td>

                      {/* Community Service Hours */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {cadet.communityServiceHours || 0} hrs
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cadet.communityServiceEvents || (cadet as any).voluntaryActivities?.length || 4} missions
                          </span>
                        </div>
                      </td>

                      {/* Merit Score */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-extrabold text-xs">
                          <Flame className="w-3 h-3 text-red-600" />
                          <span>{cadet.meritScore} pts</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Log Voluntary Community Service or Drill Hours */}
      {isLogModalOpen && currentCadet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Cadet Participation Logging
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white">
                Log Authorized Hours
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Record your community outreach or tactical training sessions to dynamically update your standing on the platoon leaderboard in Firestore.
              </p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setLogType('community')}
                className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  logType === 'community'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Community Service</span>
              </button>

              <button
                type="button"
                onClick={() => setLogType('training')}
                className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  logType === 'training'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Tactical Training</span>
              </button>
            </div>

            <form onSubmit={handleLogHoursSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {logType === 'community' ? 'Service Mission / Drive Title' : 'Drill / Training Exercise Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    logType === 'community'
                      ? 'e.g. Surma River Cleanliness Drive, Blood Donation Camp'
                      : 'e.g. Unarmed Combat Training, Obstacle Course Practice'
                  }
                  value={logFormData.title}
                  onChange={(e) => setLogFormData({ ...logFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={logFormData.category}
                    onChange={(e) => setLogFormData({ ...logFormData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {logType === 'community' ? (
                      <>
                        <option value="Disaster Relief">Disaster Relief</option>
                        <option value="Blood Donation">Blood Donation</option>
                        <option value="Tree Plantation">Tree Plantation</option>
                        <option value="Civic Outreach">Civic Outreach</option>
                        <option value="Civic Discipline">Civic Discipline</option>
                      </>
                    ) : (
                      <>
                        <option value="Foot Drill">Foot Drill</option>
                        <option value="Tactics">Tactics</option>
                        <option value="Field Craft">Field Craft</option>
                        <option value="Medical">Medical / First Aid</option>
                        <option value="Physical Fitness">Physical Fitness</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Hours Completed</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={logFormData.hours}
                    onChange={(e) => setLogFormData({ ...logFormData, hours: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date of Activity</label>
                  <input
                    type="date"
                    required
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Verifying Officer</label>
                  <input
                    type="text"
                    required
                    value={logFormData.verifiedBy}
                    onChange={(e) => setLogFormData({ ...logFormData, verifiedBy: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingLog ? 'Syncing to Cloud...' : 'Confirm & Save to Leaderboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
