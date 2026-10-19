import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  Lock,
  Mail,
  KeyRound,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  MapPin,
  X,
  Camera,
  BookOpen,
  Crown,
  UserCheck,
  Award,
  FileSpreadsheet,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import {
  getAllNotices,
  createNotice,
  activateNotice,
  updateNotice,
  deleteNotice,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  seedInitialEvents,
  NoticeRecord,
} from '../services/portalService';
import { EventItem } from '../data/siteData';
import { BnccCrest } from '../components/BnccCrest';
import { UrgentNoticeBar } from '../components/UrgentNoticeBar';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { AdminCmsPanel } from '../components/AdminCmsPanel';
import { AdminCadetsPanel } from '../components/AdminCadetsPanel';
import { AdminPostsPanel } from '../components/AdminPostsPanel';
import { AdminCadetSemesterPanel } from '../components/AdminCadetSemesterPanel';
import { AdminSemesterRecruitmentPanel } from '../components/AdminSemesterRecruitmentPanel';
import { AdminSubAdminsPanel } from '../components/AdminSubAdminsPanel';
import { AdminAnalyticsPanel } from '../components/AdminAnalyticsPanel';
import { AdminCadetReportsPanel } from '../components/AdminCadetReportsPanel';
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  verifySuperAdminPassword,
  checkAdminAccess,
  requestSubAdminAccess,
  getStoredAdminUsers,
  AdminAccessStatus,
} from '../services/adminAccessService';
import { logAdminLogin } from '../services/analyticsService';

export interface OfficerSession {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

export const AdminPage: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [officerSession, setOfficerSession] = useState<OfficerSession | null>(() => {
    const saved = localStorage.getItem('mu_bncc_officer_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [subAdminStatus, setSubAdminStatus] = useState<AdminAccessStatus | 'none'>('none');
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [tokenClaims, setTokenClaims] = useState<Record<string, any>>({});

  // Auth form state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Sub-admin request state when not approved
  const [requestDisplayName, setRequestDisplayName] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Dashboard state & Collapsible Navigation
  const [activeTab, setActiveTab] = useState<
    | 'notices'
    | 'events'
    | 'cms'
    | 'posts'
    | 'cadets'
    | 'cadet-reports'
    | 'semester-cadet'
    | 'recruitment'
    | 'analytics'
    | 'sub-admins'
  >('events');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    ops: true,
    recruitment: true,
    cms: true,
    security: true,
  });

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getTabInfo = (tab: typeof activeTab) => {
    switch (tab) {
      case 'events':
        return {
          group: isBn ? 'অপারেশন ও ক্যালেন্ডার' : 'Operations & Drills',
          label: isBn ? 'ইভেন্ট ও প্যারেড শিডিউলার' : 'Events & Parades Scheduler',
        };
      case 'notices':
        return {
          group: isBn ? 'অপারেশন ও ক্যালেন্ডার' : 'Operations & Drills',
          label: isBn ? 'বিজ্ঞপ্তি ও লাইভ টিকার' : 'Notices & Live Broadcast Ticker',
        };
      case 'analytics':
        return {
          group: isBn ? 'অপারেশন ও ট্র্যাফিক' : 'Operations & Intelligence',
          label: isBn ? 'ব্যবহারকারী কার্যকলাপ ও পৃষ্ঠা পারফরম্যান্স' : 'Page Performance & User Activity',
        };
      case 'recruitment':
        return {
          group: isBn ? 'রিক্রুটমেন্ট ও ক্যাডেট' : 'Recruitment & Cohorts',
          label: isBn ? 'সেমিস্টার ও রিক্রুটমেন্ট (গুগল শিট)' : 'Semester & Recruitment (Google Sheets)',
        };
      case 'cadets':
        return {
          group: isBn ? 'রিক্রুটমেন্ট ও ক্যাডেট' : 'Recruitment & Cohorts',
          label: isBn ? 'ক্যাডেট ভেরিফিকেশন ও নথি' : 'Cadet Verifications & Dossiers',
        };
      case 'cadet-reports':
        return {
          group: isBn ? 'রিক্রুটমেন্ট ও ক্যাডেট' : 'Recruitment & Cohorts',
          label: isBn ? 'ক্যাডেট আদমশুমারি ও অফিসিয়াল রিপোর্ট' : 'Cadet Census & Official Reports',
        };
      case 'semester-cadet':
        return {
          group: isBn ? 'রিক্রুটমেন্ট ও ক্যাডেট' : 'Recruitment & Cohorts',
          label: isBn ? 'সেমিস্টার সেরা ক্যাডেট CMS' : 'Cadet of the Semester CMS',
        };
      case 'cms':
        return {
          group: isBn ? 'পাবলিশিং ও কন্টেন্ট' : 'Publishing & Content CMS',
          label: isBn ? 'মাইলফলক, সম্মাননা ও রেকর্ডস CMS' : 'Milestones, Honors & Records CMS',
        };
      case 'posts':
        return {
          group: isBn ? 'পাবলিশিং ও কন্টেন্ট' : 'Publishing & Content CMS',
          label: isBn ? 'ব্লগ ও গল্প পোস্ট CMS' : 'Blog & Cadet Stories CMS',
        };
      case 'sub-admins':
        return {
          group: isBn ? 'প্রশাসন ও নিরাপত্তা' : 'Administration & Security',
          label: isBn ? 'সাব-অ্যাডমিন অনুমোদন ও রোল' : 'Sub-Admins & Role Approvals',
        };
      default:
        return {
          group: 'Command HQ',
          label: 'Operations Console',
        };
    }
  };

  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Notice form
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [newNoticeText, setNewNoticeText] = useState('');
  const [noticeAuthor, setNoticeAuthor] = useState('');
  const [isNoticeSubmitting, setIsNoticeSubmitting] = useState(false);

  // Event form
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<Omit<EventItem, 'id'>>({
    title: '',
    category: 'Training',
    date: new Date().toISOString().split('T')[0],
    displayDate: '',
    time: '06:45 AM - 08:30 AM',
    venue: 'Metropolitan University Central Sports Ground, Bateshwar',
    description: '',
    instructorOrLead: 'PUO Abu Yusuf Musa & CPL Jewel',
    mandatoryTurnout: 'Working Dress (Olive Green), DMS Boots, Beret',
    spotsOrAttendance: 'All active cadets (Platoon 1 & 2)',
    isUpcoming: true,
  });
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // RBAC custom claim verification function with Super Admin root authority & Sub-Admin approval verification
  const verifyClaims = async (user: User | null, session: OfficerSession | null) => {
    setClaimsLoading(true);
    try {
      const activeEmail = user?.email || session?.email;

      // 1. Root Super Admin Check (Permanent)
      if (isSuperAdminEmail(activeEmail)) {
        setIsSuperAdmin(true);
        setHasAdminClaim(true);
        setSubAdminStatus('approved');
        setTokenClaims({ role: 'Super Admin', admin: true, status: 'approved' });
        const all = getStoredAdminUsers();
        setPendingApprovalCount(all.filter((a) => a.status === 'pending').length);
        return true;
      }

      // 2. Sub-Admin Approval Check via adminAccessService
      const access = await checkAdminAccess(activeEmail);
      setIsSuperAdmin(false);
      setSubAdminStatus(access.status);
      setHasAdminClaim(access.hasAccess);
      setTokenClaims({ role: access.role, admin: access.hasAccess, status: access.status });

      if (access.hasAccess) {
        return true;
      }

      // 3. Fallback token claims if Firebase custom claims present
      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        const claims = tokenResult.claims || {};
        if (claims.admin === true || claims.role === 'admin') {
          setHasAdminClaim(true);
          setSubAdminStatus('approved');
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Error verifying token custom claims:', err);
      setHasAdminClaim(false);
      return false;
    } finally {
      setClaimsLoading(false);
    }
  };

  // Listen to auth state and perform RBAC verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        const isAdmin = await verifyClaims(user, null);
        if (isAdmin) {
          loadDashboardData();
        }
      } else if (officerSession) {
        const isAdmin = await verifyClaims(null, officerSession);
        if (isAdmin) {
          loadDashboardData();
        }
      } else {
        setHasAdminClaim(false);
        setClaimsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [officerSession]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [fetchedNotices, fetchedEvents] = await Promise.all([
        getAllNotices(),
        getAllEvents(),
      ]);
      setNotices(fetchedNotices);
      setEvents(fetchedEvents);

      // Refresh pending approvals count
      const all = getStoredAdminUsers();
      setPendingApprovalCount(all.filter((a) => a.status === 'pending').length);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmittingAuth(true);

    const cleanEmail = email.trim();
    const isSuper = isSuperAdminEmail(cleanEmail);

    // If authenticating as Root Super Admin, strictly verify the unique master password
    if (isSuper) {
      const isSuperPasswordValid = await verifySuperAdminPassword(password);
      if (!isSuperPasswordValid) {
        setAuthError('Incorrect Super Admin master password. Access denied.');
        setSubmittingAuth(false);
        return;
      }
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (isSuper) {
          showNotification('Root Super Admin registered & authenticated.');
        } else {
          // Register sub-admin request
          await requestSubAdminAccess({
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
            role: 'Sub-Admin',
          });
          showNotification('Account registered. Sub-admin approval request sent to Super Admin.');
        }
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        logAdminLogin(cleanEmail);
        if (isSuper) {
          showNotification('Welcome, Super Admin Rahad Ahmed Emon. Root access active.');
        } else {
          showNotification('Authenticating officer credentials...');
        }
      }
    } catch (err: any) {
      // Gracefully handle operation-not-allowed when email/password provider is not toggled in Console,
      // or if Super Admin authenticates in dev/preview environment with verified master password
      if (
        err.code === 'auth/operation-not-allowed' ||
        (isSuper && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password'))
      ) {
        try {
          await signInAnonymously(auth);
        } catch {
          // ignore
        }
        const session: OfficerSession = {
          uid: isSuper ? 'super-admin-rahad' : 'leader-' + Date.now(),
          email: cleanEmail,
          displayName: isSuper ? 'Rahad Ahmed Emon (Super Admin)' : cleanEmail.split('@')[0],
          role: isSuper ? 'Super Admin' : 'Sub-Admin',
        };
        localStorage.setItem('mu_bncc_officer_session', JSON.stringify(session));
        setOfficerSession(session);

        if (!isSuper) {
          await requestSubAdminAccess({
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
            role: 'Sub-Admin',
          });
        }

        const isAdmin = await verifyClaims(null, session);
        if (isAdmin) {
          showNotification(isSuper ? 'Welcome, Super Admin Rahad Ahmed Emon. Root access active.' : 'Sub-Admin authenticated.');
          logAdminLogin(cleanEmail);
          loadDashboardData();
        }
        return;
      }

      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
        setAuthError('Invalid email or password. Please verify your officer credentials or register via "Register New Leader".');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleUserSubmitSubAdminRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeEmail = currentUser?.email || officerSession?.email;
    if (!activeEmail) return;

    setIsSubmittingRequest(true);
    try {
      await requestSubAdminAccess({
        email: activeEmail,
        displayName: requestDisplayName.trim() || activeEmail.split('@')[0],
        role: 'Sub-Admin',
        notes: requestNotes.trim(),
      });
      showNotification('Sub-admin request submitted. Super Admin will review your clearance.');
      setSubAdminStatus('pending');
      await verifyClaims(currentUser, officerSession);
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem('mu_bncc_officer_session');
    setOfficerSession(null);
    setCurrentUser(null);
    setHasAdminClaim(false);
    setTokenClaims({});
    showNotification('Logged out successfully.');
  };

  // Notice handlers
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to publish urgent notices.');
      return;
    }
    if (!newNoticeText.trim()) return;

    setIsNoticeSubmitting(true);
    try {
      if (editingNoticeId) {
        await updateNotice(editingNoticeId, newNoticeText, true);
        showNotification('Urgent notice updated and broadcast live to portal!');
        setEditingNoticeId(null);
      } else {
        await createNotice(
          newNoticeText,
          noticeAuthor || currentUser?.email || officerSession?.displayName || 'Platoon Leader',
          true
        );
        showNotification('New Urgent Notice posted and broadcast live to portal!');
      }
      setNewNoticeText('');
      setNoticeAuthor('');
      await loadDashboardData();
    } catch (err: any) {
      alert('Failed to save notice: ' + err.message);
    } finally {
      setIsNoticeSubmitting(false);
    }
  };

  const handleStartEditNotice = (n: NoticeRecord) => {
    setEditingNoticeId(n.id);
    setNewNoticeText(n.text);
    setNoticeAuthor(n.author);
    setActiveTab('notices');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEditNotice = () => {
    setEditingNoticeId(null);
    setNewNoticeText('');
    setNoticeAuthor('');
  };

  const handleToggleNoticeStatus = async (notice: NoticeRecord) => {
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to update notices.');
      return;
    }
    try {
      if (!notice.isActive) {
        await activateNotice(notice.id);
        showNotification('Notice activated and broadcast live to portal!');
      } else {
        await updateNotice(notice.id, notice.text, false);
        showNotification('Notice deactivated.');
      }
      await loadDashboardData();
    } catch (err: any) {
      alert('Error updating notice: ' + err.message);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to delete notices.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      showNotification('Notice removed.');
      if (editingNoticeId === id) {
        setEditingNoticeId(null);
        setNewNoticeText('');
      }
      await loadDashboardData();
    } catch (err: any) {
      alert('Error deleting notice: ' + err.message);
    }
  };

  // Event handlers
  const handleOpenCreateEventModal = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      category: 'Training',
      date: new Date().toISOString().split('T')[0],
      displayDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      time: '06:45 AM - 08:30 AM',
      venue: 'Metropolitan University Central Sports Ground, Bateshwar',
      description: '',
      instructorOrLead: 'PUO Abu Yusuf Musa & CPL Jewel',
      mandatoryTurnout: 'Working Dress (Olive Green), DMS Boots, Beret',
      spotsOrAttendance: 'All active cadets (Platoon 1 & 2)',
      isUpcoming: true,
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEventModal = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setEventFormData({
      title: evt.title,
      category: evt.category,
      date: evt.date,
      displayDate: evt.displayDate,
      time: evt.time,
      venue: evt.venue,
      description: evt.description,
      instructorOrLead: evt.instructorOrLead,
      mandatoryTurnout: evt.mandatoryTurnout,
      spotsOrAttendance: evt.spotsOrAttendance,
      isUpcoming: evt.isUpcoming,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to manage operational events.');
      return;
    }
    if (!eventFormData.title.trim()) return;

    setIsEventSubmitting(true);
    try {
      if (editingEventId) {
        await updateEvent(editingEventId, eventFormData);
        showNotification('Event updated successfully.');
      } else {
        await createEvent(eventFormData);
        showNotification('New operational event scheduled!');
      }
      setIsEventModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      alert('Error saving event: ' + err.message);
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to delete operational events.');
      return;
    }
    if (!window.confirm('Delete this event from the portal calendar?')) return;
    try {
      await deleteEvent(id);
      showNotification('Event deleted.');
      await loadDashboardData();
    } catch (err: any) {
      alert('Error deleting event: ' + err.message);
    }
  };

  const handleSeedDefaults = async () => {
    if (!hasAdminClaim) {
      alert('RBAC Access Denied: You must possess the "admin" custom claim to restore operational events.');
      return;
    }
    if (!window.confirm('Restore standard platoon calendar events into Firestore?')) return;
    setLoadingData(true);
    await seedInitialEvents();
    await loadDashboardData();
    showNotification('Standard calendar events loaded into persistent storage.');
  };

  if (authLoading || (currentUser && claimsLoading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-600 border-t-transparent" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
          Verifying 'admin' custom claim & RBAC clearance...
        </p>
      </div>
    );
  }

  // ==========================================
  // UNATHENTICATED STATE: LOGIN / REGISTER
  // ==========================================
  if (!currentUser && !officerSession) {
    return (
      <div className="py-12 sm:py-20 px-4 max-w-md mx-auto space-y-6">
        <SEOHead
          title="Officer Login | Command Headquarters"
          titleBn="অফিসার লগইন | কমান্ড সদর দপ্তর"
          description="Restricted officer login for Metropolitan University BNCC Platoon commanders and battalion instructors."
          path="/admin"
          noindex={true}
        />
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BnccCrest size="lg" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Restricted Area
            </span>
            <h1 className="font-heading text-3xl font-extrabold uppercase text-slate-900 dark:text-white mt-1">
              Platoon Leadership Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Authentication required for Platoon Commanders, Staff Instructors, and Cadet NCOs to publish notices and events.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          {authError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Leader Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. commander@metrouni.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {submittingAuth
                  ? 'Verifying Credentials...'
                  : isRegisterMode
                  ? 'Register Platoon Officer Account'
                  : 'Authenticate as Platoon Leader'}
              </span>
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
            <span>{isRegisterMode ? 'Already have an account?' : 'Need a leader account?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError(null);
              }}
              className="font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              {isRegisterMode ? 'Sign In Instead' : 'Register New Leader'}
            </button>
          </div>

          {/* Super Admin & Officer Security Notice */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-mono">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Super Admin: <strong>rahadahmedemon11@gmail.com</strong></span>
            </div>
            <p className="text-[10px] text-slate-400">
              Demo bypass credentials removed. Sub-admins must be approved by the Super Admin to access management tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED BUT ACCESS DENIED: SUB-ADMIN APPROVAL CHECK
  // (Ensures only Super Admin or Super-Admin-approved sub-admins can access management functions)
  // ==========================================
  if (!hasAdminClaim) {
    const activeEmail = currentUser?.email || officerSession?.email || 'Authenticated User';

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-6 animate-in fade-in">
        {/* Denial / Pending Approval Header Card */}
        <div className="rounded-3xl border border-amber-200 dark:border-amber-900/80 bg-amber-50/70 dark:bg-amber-950/40 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md shrink-0">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 dark:bg-amber-900 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase text-amber-900 dark:text-amber-200">
                  {subAdminStatus === 'pending'
                    ? 'Pending Super Admin Clearance'
                    : subAdminStatus === 'revoked'
                    ? 'Sub-Admin Access Suspended'
                    : 'Super Admin Approval Required'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  PLATOON GOVERNANCE
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 dark:text-white">
                {subAdminStatus === 'pending'
                  ? 'Sub-Admin Approval Pending'
                  : subAdminStatus === 'revoked'
                  ? 'Access Privileges Revoked'
                  : 'Sub-Admin Authorization Needed'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {subAdminStatus === 'pending' ? (
                  <>
                    Your account (<strong className="font-mono text-slate-900 dark:text-white">{activeEmail}</strong>) has been queued for authorization. The Root Super Admin (<strong className="font-mono text-amber-700 dark:text-amber-300">{SUPER_ADMIN_EMAIL}</strong>) must review and grant your sub-admin approval before operational management tools can be accessed.
                  </>
                ) : subAdminStatus === 'revoked' ? (
                  <>
                    Administrative access for (<strong className="font-mono text-slate-900 dark:text-white">{activeEmail}</strong>) has been suspended by the Super Admin. Please contact <strong className="font-mono text-amber-700 dark:text-amber-300">{SUPER_ADMIN_EMAIL}</strong> for inquiry.
                  </>
                ) : (
                  <>
                    Management functions are strictly reserved for the Super Admin and verified Sub-Admins. Submit your request below to notify the Super Admin (<strong className="font-mono text-amber-700 dark:text-amber-300">{SUPER_ADMIN_EMAIL}</strong>).
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Officer Security Status
              </span>
              <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                subAdminStatus === 'pending'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  : subAdminStatus === 'revoked'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                Status: {subAdminStatus.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Current Email</span>
                <span className="text-slate-900 dark:text-white font-bold">{activeEmail}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Designated Super Admin</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold block">{SUPER_ADMIN_EMAIL}</span>
              </div>
            </div>

            {/* Request Form if status is none */}
            {subAdminStatus === 'none' && (
              <form onSubmit={handleUserSubmitSubAdminRequest} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Submit Sub-Admin Clearance Request:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name / Officer Rank"
                    value={requestDisplayName}
                    onChange={(e) => setRequestDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Appointment details / notes for Super Admin"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isSubmittingRequest ? 'Submitting...' : 'Send Request to Super Admin'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => verifyClaims(currentUser, officerSession)}
                disabled={claimsLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${claimsLoading ? 'animate-spin' : ''}`} />
                <span>Check Approval Status</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign In with Different Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED STATE: ADMIN DASHBOARD (RBAC VERIFIED)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      <SEOHead
        title="Command Headquarters | Platoon Operations & Broadcasts"
        titleBn="কমান্ড সদর দপ্তর | প্লাটুন অপারেশন ও নোটিশ সম্প্রচার"
        description="Administrative command center for Metropolitan University BNCC Platoon. Manage urgent notices, operational drills, and cadet dossiers."
        path="/admin"
        noindex={true}
      />

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* COLLAPSIBLE SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-68'}`}
      >
        {/* Sidebar Brand / Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <BnccCrest size="sm" />
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                  Command HQ
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  MU BNCC Platoon
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with Nested Dropdowns */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* GROUP 1: OPERATIONS & DRILLS */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('ops')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>{isBn ? 'অপারেশন ও ক্যালেন্ডার' : 'Operations & Drills'}</span>
                {openDropdowns.ops ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.ops || isSidebarCollapsed) && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('events');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Events & Parades (${events.length})` : undefined}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{isBn ? 'ইভেন্ট ও প্যারেড' : 'Events & Parades'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'events' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {events.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('notices');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'notices'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Notices & Live Ticker (${notices.length})` : undefined}
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{isBn ? 'বিজ্ঞপ্তি ও লাইভ টিকার' : 'Notices & Live Ticker'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'notices' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {notices.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('analytics');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'User Activity & Page Performance Analytics' : undefined}
                >
                  <TrendingUp className="w-4 h-4 shrink-0 text-red-500" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'অ্যানালিটিক্স ও ট্র্যাফিক' : 'Analytics & User Activity'}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: RECRUITMENT & COHORTS */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('recruitment')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>{isBn ? 'রিক্রুটমেন্ট ও ক্যাডেট' : 'Recruitment & Cohorts'}</span>
                {openDropdowns.recruitment ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.recruitment || isSidebarCollapsed) && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recruitment');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'recruitment'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Semester & Recruitment (Google Sheets)' : undefined}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-500" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'সেমিস্টার ও রিক্রুটমেন্ট' : 'Semester & Recruitment'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('cadets');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'cadets'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Cadet Verifications & Dossiers' : undefined}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'ক্যাডেট ভেরিফিকেশন' : 'Cadet Verifications'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('cadet-reports');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'cadet-reports'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Registered Cadets Census & Official Reports' : undefined}
                >
                  <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'ক্যাডেট আদমশুমারি ও রিপোর্ট' : 'Cadet Reports & Census'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('semester-cadet');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'semester-cadet'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Cadet of the Semester CMS' : undefined}
                >
                  <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'সেমিস্টার সেরা ক্যাডেট CMS' : 'Cadet of Semester CMS'}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 3: PUBLISHING & CMS */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('cms')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>{isBn ? 'পাবলিশিং ও কন্টেন্ট' : 'Publishing & CMS'}</span>
                {openDropdowns.cms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.cms || isSidebarCollapsed) && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('cms');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'cms'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Milestones, Honors & Records CMS' : undefined}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'মাইলফলক ও সম্মাননা CMS' : 'Milestones & Honors CMS'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('posts');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'posts'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Blog & Story Posts CMS' : undefined}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{isBn ? 'ব্লগ ও গল্প পোস্ট CMS' : 'Blog & Story Posts CMS'}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 4: ADMINISTRATION & SECURITY */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('security')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>{isBn ? 'প্রশাসন ও নিরাপত্তা' : 'Administration'}</span>
                {openDropdowns.security ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.security || isSidebarCollapsed) && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sub-admins');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'sub-admins'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Sub-Admins & Role Approvals (${pendingApprovalCount})` : undefined}
                >
                  <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{isBn ? 'সাব-অ্যাডমিন রোল' : 'Sub-Admins & Roles'}</span>
                      {pendingApprovalCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">
                          {pendingApprovalCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer: Security Status */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>RBAC Clearance</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {isSuperAdmin ? 'Super Admin Authority' : 'Verified Sub-Admin'}
              </p>
            </div>
          ) : (
            <div className="flex justify-center p-1" title={isSuperAdmin ? 'Super Admin (Root)' : 'Sub-Admin'}>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT WITH STICKY TOP HEADER & BREADCRUMBS */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar with Global Actions & Breadcrumb Trail */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle + Breadcrumb Trail */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>

            {/* Dedicated Breadcrumb Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors" onClick={() => setActiveTab('events')}>
                HQ
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
                {getTabInfo(activeTab).group}
              </span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white truncate font-mono text-[11px] sm:text-xs">
                {getTabInfo(activeTab).label}
              </span>
            </nav>
          </div>

          {/* Right: Global Actions (Live Ticker Indicator, Sync, Profile Pill, Sign Out) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Ticker Pulse Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Broadcast Active</span>
            </div>

            {/* Sync Button */}
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loadingData}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh and sync all operational data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isBn ? 'সিঙ্ক' : 'Sync'}</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {isSuperAdmin ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-amber-500 text-slate-950">
                  ROOT
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-600 text-white">
                  SUB-ADMIN
                </span>
              )}
              <span className="hidden md:inline font-mono text-slate-700 dark:text-slate-300 max-w-[140px] truncate">
                {currentUser?.email || officerSession?.email || 'admin'}
              </span>
            </div>

            {/* Global Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors"
              title="Sign out of administrative portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBn ? 'সাইন আউট' : 'Sign Out'}</span>
            </button>
          </div>
        </header>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {actionSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

      {/* ======================================= */}
      {/* TAB 1: URGENT NOTICES & LIVE TICKER MANAGEMENT */}
      {/* ======================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Unified Live Urgent Notice Bar Ticker Preview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-heading text-sm sm:text-base font-bold uppercase text-slate-900 dark:text-white">
                  {isBn ? 'লাইভ টিকার প্রিভিউ' : 'Live Ticker Preview'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {isBn ? 'ওয়েবসাইটে বর্তমান সক্রিয় নোটিশ' : 'Current Active Broadcast on Portal'}
              </span>
            </div>

            <div className="pt-1">
              <UrgentNoticeBar />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBn
                ? 'এই প্রিভিউটি হোমপেজের লাইভ জরুরি নোটিশ টিকারের রিয়েল-টাইম অবস্থা সরাসরি প্রদর্শন করছে।'
                : 'This preview reflects the currently active notice rendered live across the website.'}
            </p>
          </div>

          {/* Post New Notice Form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  Broadcast Console
                </span>
                <h2 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                  {editingNoticeId ? 'Edit Urgent Notice' : 'Post New Urgent Notice'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Updates UrgentNoticeBar across the entire website
              </span>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Urgent Notice Text *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. INTAKE 2025–26: Physical screening scheduled for Wednesday 06:45 AM at MU Sports Complex. Cadets must report in sports attire with Student ID."
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Author / Issuing Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PUO Abu Yusuf Musa"
                    value={noticeAuthor}
                    onChange={(e) => setNoticeAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="flex items-end gap-2">
                  {editingNoticeId && (
                    <button
                      type="button"
                      onClick={handleCancelEditNotice}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isNoticeSubmitting || !newNoticeText.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {isNoticeSubmitting
                        ? 'Broadcasting...'
                        : editingNoticeId
                        ? 'Update & Broadcast'
                        : 'Publish Urgent Notice'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Notices History / List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                Notices History & Persistent Records
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {notices.length} items logged
              </span>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-5 shadow-xs transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    n.isActive
                      ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 dark:border-emerald-800/60'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-75'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {n.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Currently Active on Portal
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 font-mono">
                          Inactive Archive
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">
                        {n.author} · {new Date(n.updatedAt || n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {n.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleNoticeStatus(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        n.isActive
                          ? 'border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                          : 'border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      }`}
                    >
                      {n.isActive ? 'Deactivate' : 'Set as Active'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEditNotice(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit notice"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: EVENTS MANAGEMENT */}
      {/* ======================================= */}
      {/* ======================================= */}
      {/* TAB 2: EVENTS & PARADE ROSTER */}
      {/* ======================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                    Operational Roster
                  </span>
                  <h2 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                    Platoon Events & Parade Scheduler
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSeedDefaults}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Populate standard university platoon calendar"
                  >
                    Restore Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreateEventModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Event</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-red-600 dark:text-red-400 uppercase">
                          {evt.category}
                        </span>
                        <span className="text-slate-400">{evt.displayDate || evt.date}</span>
                      </div>

                      <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{evt.time}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                        Lead: {evt.instructorOrLead}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEventModal(evt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: USER ACTIVITY & PAGE PERFORMANCE   */}
      {/* ======================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminAnalyticsPanel />
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: SEMESTER & RECRUITMENT MANAGEMENT */}
      {/* ======================================= */}
      {activeTab === 'recruitment' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminSemesterRecruitmentPanel />
        </div>
      )}



      {/* ======================================= */}
      {/* TAB 4: PLATOON HIGHLIGHTS & FIELD RECORDS CMS */}
      {/* ======================================= */}
      {activeTab === 'cms' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminCmsPanel />
        </div>
      )}



      {/* ======================================= */}
      {/* TAB: BLOG & SHORT STORY POSTS CMS */}
      {/* ======================================= */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminPostsPanel />
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 5: CADET ROSTER & VERIFICATION CONTROL */}
      {/* ======================================= */}
      {activeTab === 'cadets' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminCadetsPanel />
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: REGISTERED CADETS CENSUS & REPORTS */}
      {/* ======================================= */}
      {activeTab === 'cadet-reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminCadetReportsPanel />
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 6: CADET OF THE SEMESTER PUBLISHING */}
      {/* ======================================= */}
      {activeTab === 'semester-cadet' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminCadetSemesterPanel />
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 7: SUB-ADMINS & ROLES APPROVAL (SUPER ADMIN) */}
      {/* ======================================= */}
      {activeTab === 'sub-admins' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AdminSubAdminsPanel
            currentOfficerEmail={currentUser?.email || officerSession?.email || undefined}
            onNotification={showNotification}
            onUpdatePendingCount={setPendingApprovalCount}
          />
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: CREATE / EDIT EVENT */}
      {/* ======================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-slate-900 dark:text-slate-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase">
                {editingEventId ? 'Edit Event Directives' : 'Schedule New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day Ceremonial Parade"
                  value={eventFormData.title}
                  onChange={(e) =>
                    setEventFormData({ ...eventFormData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Training">Training</option>
                    <option value="Campus Duty">Campus Duty</option>
                    <option value="Camp / Parade">Camp / Parade</option>
                    <option value="Community Service">Community Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventFormData.date}
                    onChange={(e) => {
                      const d = e.target.value;
                      const dateObj = new Date(d);
                      const displayStr = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : d;
                      setEventFormData({
                        ...eventFormData,
                        date: d,
                        displayDate: displayStr,
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 06:45 AM - 08:30 AM"
                    value={eventFormData.time}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, time: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MU Central Ground"
                    value={eventFormData.venue}
                    onChange={(e) =>
                      setEventFormData({ ...eventFormData, venue: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Event Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the event objectives, drill routine, or ceremony schedule..."
                  value={eventFormData.description}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Officer / Lead
                  </label>
                  <input
                    type="text"
                    value={eventFormData.instructorOrLead}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        instructorOrLead: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Turnout Requirement
                  </label>
                  <input
                    type="text"
                    value={eventFormData.mandatoryTurnout}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        mandatoryTurnout: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEventSubmitting}
                  className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isEventSubmitting
                    ? 'Saving...'
                    : editingEventId
                    ? 'Update Event'
                    : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
