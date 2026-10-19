import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getAnalyticsSummary,
  exportAnalyticsCsv,
  resetAnalyticsToDefaults,
  AnalyticsSummary,
  PageStat,
  UserActivityLog,
} from '../services/analyticsService';

export const AdminAnalyticsPanel: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityCategory, setActivityCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setIsRefreshing(true);
    const data = getAnalyticsSummary(timeRange);
    setSummary(data);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setSummary(getAnalyticsSummary(timeRange));
    };

    window.addEventListener('mu-bncc-analytics-updated', handleUpdate);
    return () => window.removeEventListener('mu-bncc-analytics-updated', handleUpdate);
  }, [timeRange]);

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = () => {
    if (!summary) return;
    exportAnalyticsCsv(summary.pages);
    showMsg('Page performance report downloaded as CSV.');
  };

  const handleReset = () => {
    if (window.confirm('Reset analytics tracking data back to baseline defaults?')) {
      resetAnalyticsToDefaults();
      loadData();
      showMsg('Analytics data reset to baseline stats.');
    }
  };

  if (!summary) return null;

  const filteredPages = summary.pages.filter(
    (p) =>
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = summary.recentActivities.filter((act) => {
    if (activityCategory === 'all') return true;
    return act.category === activityCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Alert */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* TOP HEADER & TIME FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Web Intelligence & Telemetry
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-slate-900 dark:text-white">
            User Activity & Page Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics analyzing page traffic, user engagement, and operational conversion flows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {(['today', '7days', '30days', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === '7days'
                  ? '7 Days'
                  : range === '30days'
                  ? '30 Days'
                  : 'All Time'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            title="Export CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors"
            title="Reset to baseline data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Views */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Page Views</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {summary.totalPageViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span>{summary.totalPageViews > 0 ? `${summary.totalPageViews} recorded hit${summary.totalPageViews === 1 ? '' : 's'}` : 'Live telemetry tracking active'}</span>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Unique Visitors</span>
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {summary.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Across campus network & public web
          </div>
        </div>

        {/* Card 3: Top Performing Page */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Top Performing Page</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="truncate">
            <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {summary.topPerformingPage.path}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold truncate">
              {summary.topPerformingPage.views.toLocaleString()} hits (
              {Math.round((summary.topPerformingPage.views / (summary.totalPageViews || 1)) * 100)}% of traffic)
            </div>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {summary.topPerformingPage.title}
          </div>
        </div>

        {/* Card 4: Conversion / Engagement */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Action Conversion Rate</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {summary.conversionRatePercent}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Recruitment joins & cadet login activities
          </div>
        </div>
      </div>

      {/* SECTION: PAGE PERFORMANCE LEADERBOARD */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              <span>Page Performance & Traffic Ranking</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparison of page hits, visitor counts, and relative performance tiers.
            </p>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search page route or title..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Page table */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Page Route</th>
                <th className="py-3 px-3">Page Name</th>
                <th className="py-3 px-3">Total Views</th>
                <th className="py-3 px-3">Traffic Share</th>
                <th className="py-3 px-3">Avg Time</th>
                <th className="py-3 px-3">Bounce</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredPages.map((page, idx) => {
                const sharePercent = Math.round((page.views / (summary.totalPageViews || 1)) * 100);
                return (
                  <tr
                    key={page.path}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                        {page.path}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800 dark:text-slate-200 font-semibold max-w-xs truncate">
                      {page.title}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${Math.min(100, sharePercent * 2.5)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 w-8">
                          {sharePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {page.avgTimeSeconds}s
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      {page.bounceRatePercent}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          page.performanceBadge === 'Top Performer'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : page.performanceBadge === 'High Traffic'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                            : page.performanceBadge === 'Growing'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {page.performanceBadge}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={page.path}
                        target="_blank"
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Open page in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: DEVICE DEMOGRAPHICS & TRAFFIC TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>Visitor Device Breakdown</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span>Desktop & Laptops</span>
                </span>
                <span className="font-mono font-bold">{summary.deviceBreakdown.desktop}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${summary.deviceBreakdown.desktop}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mobile Handsets</span>
                </span>
                <span className="font-mono font-bold">{summary.deviceBreakdown.mobile}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${summary.deviceBreakdown.mobile}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Tablet className="w-3.5 h-3.5 text-purple-500" />
                  <span>Tablets & iPads</span>
                </span>
                <span className="font-mono font-bold">{summary.deviceBreakdown.tablet}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${summary.deviceBreakdown.tablet}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            💡 <strong className="text-slate-700 dark:text-slate-300">Device Telemetry:</strong>{' '}
            {summary.deviceBreakdown.desktop + summary.deviceBreakdown.mobile + summary.deviceBreakdown.tablet > 0 ? (
              <span>
                {summary.deviceBreakdown.mobile}% mobile, {summary.deviceBreakdown.desktop}% desktop, {summary.deviceBreakdown.tablet}% tablet.
              </span>
            ) : (
              <span>Client device telemetry is recorded in real time as visitors and cadets navigate the portal.</span>
            )}
          </div>
        </div>

        {/* 7-Day Traffic Activity Bars */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Daily Traffic Trend (Last 7 Days)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Traffic Rhythm</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-40">
            {summary.dailyTraffic.map((day) => {
              const maxViewsInWeek = Math.max(1, ...summary.dailyTraffic.map((d) => d.views));
              const heightPercent = day.views > 0 ? Math.max(10, Math.round((day.views / maxViewsInWeek) * 100)) : 0;
              return (
                <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{day.views}</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full max-h-24 flex items-end">
                    <div
                      className={`w-full bg-gradient-to-t from-red-700 to-rose-500 rounded-t-lg transition-all ${
                        heightPercent === 0 ? 'h-0.5 opacity-20' : ''
                      }`}
                      style={{ height: heightPercent > 0 ? `${heightPercent}%` : '2px' }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION: REAL-TIME USER ACTIVITY STREAM */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Live User Activity & Event Stream</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail of visitor interactions, cadet registrations, and administrative operations.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'recruitment', label: 'Recruitment' },
              { id: 'cadet_portal', label: 'Cadet Portal' },
              { id: 'page_view', label: 'Page Views' },
              { id: 'engagement', label: 'Stories & Shares' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActivityCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activityCategory === cat.id
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity items list */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              No recent events matching this filter.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = new Date(act.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        act.category === 'recruitment'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : act.category === 'cadet_portal'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                          : act.category === 'admin_action'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {act.category === 'recruitment' ? (
                        <FileSpreadsheet className="w-4 h-4" />
                      ) : act.category === 'cadet_portal' ? (
                        <Users className="w-4 h-4" />
                      ) : act.category === 'admin_action' ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-bold text-xs uppercase text-slate-900 dark:text-white">
                          {act.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {act.actor}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          via {act.device}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{act.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {act.target && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                        {act.target}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {dateFormatted} · {timeFormatted}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
