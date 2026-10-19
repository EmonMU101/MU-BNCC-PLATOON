/**
 * Analytics and User Activity Tracking Service for MU BNCC Official Portal
 * Tracks page views, user engagement, and operational events across the website.
 */

export interface PageStat {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSeconds: number;
  bounceRatePercent: number;
  performanceBadge: 'Top Performer' | 'High Traffic' | 'Growing' | 'Moderate';
}

export interface UserActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'page_view' | 'recruitment' | 'cadet_portal' | 'engagement' | 'admin_action';
  actionType?: 'registration' | 'profile_update' | 'login' | 'verification' | 'page_view' | 'recruitment' | 'other';
  details: string;
  target?: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  actor: 'Visitor' | 'Cadet' | 'Admin';
}

export interface PortalSectionStat {
  sectionKey: string;
  name: string;
  description: string;
  views: number;
  uniqueVisitors: number;
  percentageOfTotal: number;
  trend: string;
  color: string;
  badge: 'Highest Traffic' | 'Core Portal' | 'Growing Demand' | 'Operational';
  path: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  topPerformingPage: PageStat;
  conversionRatePercent: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  dailyTraffic: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  pages: PageStat[];
  sections: PortalSectionStat[];
  recentActivities: UserActivityLog[];
}

const PAGE_STATS_KEY = 'mu_bncc_page_stats';
const ACTIVITY_LOGS_KEY = 'mu_bncc_user_activity_logs';
const SESSION_ID_KEY = 'mu_bncc_analytics_session';

const PAGE_TITLE_MAP: Record<string, string> = {
  '/': 'Home — Metropolitan University BNCC Platoon',
  '/about': 'About Us & Platoon History',
  '/how-to-join': 'How to Join BNCC & Recruitment Guide',
  '/frameworks': 'Training Frameworks & Benefits',
  '/events': 'Events & Parades Calendar',
  '/gallery': 'Media Gallery & Regimental Photos',
  '/blog': 'Cadet Experience Blog & Articles',
  '/stories': 'Cadet Stories & Community Feed',
  '/cadet-portal': 'Cadet Member Dashboard & Portal',
  '/dashboard': 'Cadet Member Dashboard & Portal',
  '/admin': 'Command HQ Admin Portal',
};

// Clean authentic baseline data: pages start at 0 views and track live telemetry
const DEFAULT_PAGE_STATS: PageStat[] = [
  {
    path: '/',
    title: 'Home — Metropolitan University BNCC Platoon',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/how-to-join',
    title: 'How to Join BNCC & Recruitment Guide',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/events',
    title: 'Events & Parades Calendar',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/cadet-portal',
    title: 'Cadet Member Dashboard & Portal',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/about',
    title: 'About Us & Platoon History',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/frameworks',
    title: 'Training Frameworks & Benefits',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/gallery',
    title: 'Media Gallery & Regimental Photos',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/stories',
    title: 'Cadet Stories & Community Feed',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/blog',
    title: 'Cadet Experience Blog & Articles',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
  {
    path: '/admin',
    title: 'Command HQ Admin Portal',
    views: 0,
    uniqueVisitors: 0,
    avgTimeSeconds: 0,
    bounceRatePercent: 0,
    performanceBadge: 'Moderate',
  },
];

// Clean authentic activity stream: starts with 0 mock logs
const DEFAULT_ACTIVITY_LOGS: UserActivityLog[] = [];

// Helper to detect device
const detectDevice = (): 'Desktop' | 'Mobile' | 'Tablet' => {
  if (typeof window === 'undefined') return 'Desktop';
  const width = window.innerWidth;
  if (width < 640) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
};

// Helper for session id
export const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'ses_default';
  }
};

/**
 * Get current page stats (with legacy mock data purging)
 */
export const getPageStats = (): PageStat[] => {
  try {
    const raw = localStorage.getItem(PAGE_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Purge legacy mock numbers (1840, 1290, 890, etc.)
        const hasLegacyMock = parsed.some(
          (p: any) => p.views === 1840 || p.views === 1290 || p.views === 890 || p.views === 740
        );
        if (!hasLegacyMock) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse page stats:', e);
  }
  // Initialize with clean zero-state
  try {
    localStorage.setItem(PAGE_STATS_KEY, JSON.stringify(DEFAULT_PAGE_STATS));
  } catch {}
  return DEFAULT_PAGE_STATS;
};

/**
 * Get current user activity logs (with legacy mock data purging)
 */
export const getUserActivityLogs = (): UserActivityLog[] => {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Purge legacy mock activity logs (which had id: 'act-1' .. 'act-8')
        const cleaned = parsed.filter(
          (log: any) =>
            !['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7', 'act-8'].includes(log.id) &&
            !log.details?.includes('MU-REC-8921')
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Failed to parse activity logs:', e);
  }
  try {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
  } catch {}
  return DEFAULT_ACTIVITY_LOGS;
};

/**
 * Track page view automatically
 */
export const logPageView = (pathname: string, pageTitle?: string) => {
  try {
    const currentStats = getPageStats();
    const cleanPath = pathname.split('?')[0].split('#')[0] || '/';
    const title = pageTitle || PAGE_TITLE_MAP[cleanPath] || `Page ${cleanPath}`;

    let updated = false;
    const newStats = currentStats.map((item) => {
      if (item.path === cleanPath || (cleanPath.startsWith('/cadet/') && item.path.startsWith('/cadet/'))) {
        updated = true;
        const newViews = item.views + 1;
        const newVisitors = item.uniqueVisitors + 1;
        return {
          ...item,
          views: newViews,
          uniqueVisitors: newVisitors,
          performanceBadge:
            newViews >= 50
              ? ('Top Performer' as const)
              : newViews >= 20
              ? ('High Traffic' as const)
              : newViews >= 5
              ? ('Growing' as const)
              : ('Moderate' as const),
        };
      }
      return item;
    });

    if (!updated) {
      newStats.push({
        path: cleanPath,
        title,
        views: 1,
        uniqueVisitors: 1,
        avgTimeSeconds: 0,
        bounceRatePercent: 0,
        performanceBadge: 'Moderate',
      });
    }

    // Sort descending by views
    newStats.sort((a, b) => b.views - a.views);
    localStorage.setItem(PAGE_STATS_KEY, JSON.stringify(newStats));

    // Also log recent activity
    logUserActivity({
      action: `Page Visited: ${cleanPath}`,
      category: 'page_view',
      actionType: 'page_view',
      details: `Visitor navigated to ${title}`,
      target: cleanPath,
      device: detectDevice(),
      actor: cleanPath.startsWith('/admin') ? 'Admin' : cleanPath.startsWith('/cadet-portal') ? 'Cadet' : 'Visitor',
    });

    window.dispatchEvent(new CustomEvent('mu-bncc-analytics-updated'));
  } catch (err) {
    console.warn('Analytics log error:', err);
  }
};

/**
 * Log custom user activity event
 */
export const logUserActivity = (
  entry: Omit<UserActivityLog, 'id' | 'timestamp' | 'device'> & { device?: 'Desktop' | 'Mobile' | 'Tablet' }
) => {
  try {
    const current = getUserActivityLogs();
    const newLog: UserActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      device: entry.device || detectDevice(),
      ...entry,
    };

    const updated = [newLog, ...current].slice(0, 100); // keep last 100 activities
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mu-bncc-analytics-updated'));
  } catch (err) {
    console.warn('User activity log error:', err);
  }
};

/**
 * Get comprehensive analytics summary (100% authentic, real data without mocks)
 */
export const getAnalyticsSummary = (timeRange: 'today' | '7days' | '30days' | 'all' = 'all'): AnalyticsSummary => {
  const pages = getPageStats();
  const activities = getUserActivityLogs();

  // Filter activities by time range
  const now = Date.now();
  const maxAgeMs =
    timeRange === 'today'
      ? 24 * 60 * 60 * 1000
      : timeRange === '7days'
      ? 7 * 24 * 60 * 60 * 1000
      : timeRange === '30days'
      ? 30 * 24 * 60 * 60 * 1000
      : Infinity;

  const filteredActivities = activities.filter((act) => {
    const age = now - new Date(act.timestamp).getTime();
    return age <= maxAgeMs;
  });

  const totalPageViews = pages.reduce((acc, p) => acc + (p.views || 0), 0);
  const uniqueVisitors = pages.reduce((acc, p) => acc + (p.uniqueVisitors || 0), 0);

  // Top performing page
  const sortedPages = [...pages].sort((a, b) => b.views - a.views);
  const topPerformingPage =
    sortedPages.find((p) => p.views > 0) ||
    sortedPages[0] || {
      path: '/',
      title: 'Home — Metropolitan University BNCC Platoon',
      views: 0,
      uniqueVisitors: 0,
      avgTimeSeconds: 0,
      bounceRatePercent: 0,
      performanceBadge: 'Moderate',
    };

  // Real device breakdown based on logged activity events
  const desktopCount = filteredActivities.filter((a) => a.device === 'Desktop').length;
  const mobileCount = filteredActivities.filter((a) => a.device === 'Mobile').length;
  const tabletCount = filteredActivities.filter((a) => a.device === 'Tablet').length;
  const totalDeviceLogs = desktopCount + mobileCount + tabletCount;

  const deviceBreakdown =
    totalDeviceLogs > 0
      ? {
          desktop: Math.round((desktopCount / totalDeviceLogs) * 100),
          mobile: Math.round((mobileCount / totalDeviceLogs) * 100),
          tablet: Math.round((tabletCount / totalDeviceLogs) * 100),
        }
      : { desktop: 0, mobile: 0, tablet: 0 };

  // Generate 7-day traffic trend based on actual logged page views
  const dailyTraffic = [];
  const days = 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const dayActivities = activities.filter((a) => {
      const t = new Date(a.timestamp).getTime();
      return t >= dayStart && t < dayEnd;
    });

    const dayViews = dayActivities.filter((a) => a.category === 'page_view').length;
    const dayVisitors = new Set(dayActivities.map((a) => a.details)).size;

    dailyTraffic.push({
      date: dateStr,
      views: dayViews,
      visitors: dayVisitors,
    });
  }

  // Real conversion rate: recruitment applications submitted vs total page views
  const recruitmentActions = activities.filter(
    (a) => a.category === 'recruitment' || a.actionType === 'recruitment'
  ).length;
  const conversionRatePercent =
    totalPageViews > 0
      ? Math.round((recruitmentActions / totalPageViews) * 100 * 10) / 10
      : 0;

  return {
    totalPageViews,
    uniqueVisitors,
    topPerformingPage,
    conversionRatePercent,
    deviceBreakdown,
    dailyTraffic,
    pages,
    sections: getPortalSectionsTraffic(pages),
    recentActivities: filteredActivities,
  };
};

/**
 * Group pages and calculate traffic per section of the portal
 */
export const getPortalSectionsTraffic = (pages: PageStat[] = getPageStats()): PortalSectionStat[] => {
  const totalViews = pages.reduce((acc, p) => acc + p.views, 0) || 1;

  const findViews = (routes: string[]) => {
    return pages
      .filter((p) => routes.some((r) => p.path === r || (r.endsWith('*') && p.path.startsWith(r.slice(0, -1)))))
      .reduce(
        (acc, curr) => ({
          views: acc.views + curr.views,
          uniqueVisitors: acc.uniqueVisitors + curr.uniqueVisitors,
        }),
        { views: 0, uniqueVisitors: 0 }
      );
  };

  const sectionsDef = [
    {
      sectionKey: 'home',
      name: 'Home & Public Portal',
      description: 'Main landing page, platoon creed, motto, and live news ticker',
      routes: ['/'],
      path: '/',
      color: 'bg-red-600',
    },
    {
      sectionKey: 'recruitment',
      name: 'Recruitment & Admissions',
      description: 'Enrolment requirements, physical test guides, and online application dossier',
      routes: ['/how-to-join', '/frameworks'],
      path: '/how-to-join',
      color: 'bg-emerald-600',
    },
    {
      sectionKey: 'cadet_portal',
      name: 'Cadet Portal & Dossiers',
      description: 'Cadet operational dashboard, training logs, rank verifications, and public dossiers',
      routes: ['/cadet-portal', '/dashboard', '/cadet/*'],
      path: '/cadet-portal',
      color: 'bg-amber-600',
    },
    {
      sectionKey: 'events',
      name: 'Events & Parades Calendar',
      description: 'University flag parades, drill dates, and central annual training camps',
      routes: ['/events'],
      path: '/events',
      color: 'bg-blue-600',
    },
    {
      sectionKey: 'about',
      name: 'History & Leadership',
      description: 'Platoon Commander message, regimental affiliation, and officer records',
      routes: ['/about'],
      path: '/about',
      color: 'bg-indigo-600',
    },
    {
      sectionKey: 'media',
      name: 'Gallery & Experience Stories',
      description: 'Cadet blogs, camp reflections, community feed, and photo archives',
      routes: ['/gallery', '/blog', '/stories'],
      path: '/gallery',
      color: 'bg-purple-600',
    },
  ];

  return sectionsDef.map((sec) => {
    const stats = findViews(sec.routes);
    const percentage = totalViews > 0 ? Math.round((stats.views / totalViews) * 100) : 0;
    const badge =
      stats.views >= 50
        ? ('Highest Traffic' as const)
        : stats.views >= 20
        ? ('Core Portal' as const)
        : stats.views >= 5
        ? ('Growing Demand' as const)
        : ('Operational' as const);

    const trend =
      stats.views > 0
        ? `${stats.views} view${stats.views === 1 ? '' : 's'} recorded`
        : 'Awaiting traffic';

    return {
      ...sec,
      views: stats.views,
      uniqueVisitors: stats.uniqueVisitors,
      percentageOfTotal: percentage,
      badge,
      trend,
    };
  });
};

/**
 * Dedicated Activity Logger Helpers
 */
export const logCadetLogin = (cadetId: string, fullName: string) => {
  logUserActivity({
    action: 'Cadet Login',
    actionType: 'login',
    category: 'cadet_portal',
    details: `Cadet ${fullName} (${cadetId}) signed into Cadet Operational Portal`,
    target: '/cadet-portal',
    actor: 'Cadet',
  });
};

export const logCadetRegistration = (cadetId: string, fullName: string, department: string) => {
  logUserActivity({
    action: 'New Cadet Registration',
    actionType: 'registration',
    category: 'cadet_portal',
    details: `New cadet dossier registered: ${fullName} (${cadetId}) · ${department}`,
    target: `/cadet/${cadetId}`,
    actor: 'Cadet',
  });
};

export const logCadetProfileUpdate = (cadetId: string, fullName: string, detail?: string) => {
  logUserActivity({
    action: 'Profile Update',
    actionType: 'profile_update',
    category: 'cadet_portal',
    details: `Cadet ${fullName} (${cadetId}) updated profile details ${detail ? `(${detail})` : ''}`,
    target: `/cadet/${cadetId}`,
    actor: 'Cadet',
  });
};

export const logAdminLogin = (email: string) => {
  logUserActivity({
    action: 'Admin Login',
    actionType: 'login',
    category: 'admin_action',
    details: `Admin officer authenticated Command HQ session: ${email}`,
    target: '/admin',
    actor: 'Admin',
  });
};

export const logRecruitSubmission = (fullName: string, studentId: string, semester: string) => {
  logUserActivity({
    action: 'New Recruitment Registration',
    actionType: 'recruitment',
    category: 'recruitment',
    details: `New candidate application: ${fullName} (Student ID: ${studentId}) for ${semester}`,
    target: '/how-to-join',
    actor: 'Visitor',
  });
};

export const logCadetVerification = (cadetId: string, fullName: string, verified: boolean) => {
  logUserActivity({
    action: verified ? 'Cadet Verified' : 'Cadet Verification Removed',
    actionType: 'verification',
    category: 'admin_action',
    details: `Officer updated verification status for ${fullName} (${cadetId}) to ${verified ? 'VERIFIED' : 'PENDING'}`,
    target: '/admin',
    actor: 'Admin',
  });
};

/**
 * Export page performance to CSV
 */
export const exportAnalyticsCsv = (pages: PageStat[]) => {
  const headers = ['Rank', 'Page Path', 'Page Title', 'Total Views', 'Unique Visitors', 'Avg Duration (sec)', 'Bounce Rate', 'Status'];
  const rows = pages.map((p, idx) => [
    idx + 1,
    `"${p.path}"`,
    `"${p.title.replace(/"/g, '""')}"`,
    p.views,
    p.uniqueVisitors,
    p.avgTimeSeconds,
    `${p.bounceRatePercent}%`,
    p.performanceBadge,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MU_BNCC_Page_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Reset tracking stats to baseline
 */
export const resetAnalyticsToDefaults = () => {
  localStorage.setItem(PAGE_STATS_KEY, JSON.stringify(DEFAULT_PAGE_STATS));
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
  window.dispatchEvent(new CustomEvent('mu-bncc-analytics-updated'));
};
